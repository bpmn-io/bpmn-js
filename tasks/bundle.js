var browserify = require('browserify'),
    derequire = require('derequire'),
    UglifyJS = require('uglify-js'),
    exposify = require('exposify'),
    collapse = require('bundle-collapser/plugin'),
    concat = require('source-map-concat'),
    fs = require('fs'),
    path = require('path');


var BANNER = fs.readFileSync(__dirname + '/banner.txt', 'utf8'),
    BANNER_MIN = fs.readFileSync(__dirname + '/banner-min.txt', 'utf8');

var EXTERNALS = {
  sax: 'sax',
  snapsvg: 'Snap',
  lodash: '_',
  hammerjs: 'Hammer',
  jquery: '$',
  'jquery-mousewheel': '$'
};


function extractSourceMap(content) {

  var SOURCE_MAP_HEADER = '//# sourceMappingURL=data:application/json;base64,';

  var idx = content.indexOf(SOURCE_MAP_HEADER),
      map, code;

  if (idx !== -1) {
    code = content.substring(0, idx);
    map = content.substring(idx + SOURCE_MAP_HEADER.length);

    map = new Buffer(map, 'base64').toString();

    map = map.replace(/\\\\/g, '/'); // convert \\ -> /

    var dir = __dirname;

    var dirPattern = dir.replace(/\\/g, '/').replace(/\./g, '\\.') + '/';

    var pattern = new RegExp(dirPattern, 'g');

    map = map.replace(pattern, '');

    return {
      code: code,
      map: JSON.parse(map)
    };
  } else {
    throw new Error('no attached source map');
  }
}


function uglify(bundle, preamble) {
  return UglifyJS.minify(bundle.code, {
    fromString: true,
    output: {
      preamble: preamble
    }
  });
}


module.exports = function(grunt) {

  grunt.registerMultiTask('bundle', function(target) {

    var data = this.data,
        variant = data.name,
        dest = data.dest,
        src = path.resolve(data.src);

    grunt.config.set('config.variant', variant);

    var done = this.async();

    var browserifyOptions = {
      builtins: false,
      standalone: 'BpmnJS',
      detectGlobals: false,
      insertGlobalVars: [],
      debug: true
    };

    var exposifyOptions = {
      global: true,
      expose: EXTERNALS
    };

    var targetFileBase = path.join(dest, variant);

    var banner = grunt.template.process(BANNER, grunt.config.get()),
        bannerMin = grunt.template.process(BANNER_MIN, grunt.config.get());


    browserify(browserifyOptions)
      .transform(exposify, exposifyOptions)
      .plugin(collapse)
      .add(src)
      .bundle(function(err, result) {

        if (err) {
          return done(err);
        }

        var bundled, minified;

        bundled = extractSourceMap(derequire(result.toString('utf8')));

        try {
          minified = uglify(bundled, bannerMin);
        } catch (e) {
          return done(e);
        }

        var bannerBundled;

        try {
          bannerBundled = concat([ bundled ])
                            .prepend(banner + '\n')
                            .add('//# sourceMappingURL=' + variant + '.js.map')
                            .toStringWithSourceMap();
        } catch (e) {
          console.error(e.stack);
          throw e;
        }

        grunt.file.write(targetFileBase + '.js', bannerBundled.code, 'utf8');
        grunt.file.write(targetFileBase + '.js.map', bannerBundled.map, 'utf8');

        grunt.file.write(targetFileBase + '.min.js', minified.code, 'utf8');

        done();
      });

  });

};