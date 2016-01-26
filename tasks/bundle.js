'use strict';

var browserify = require('browserify'),
    derequire = require('browserify-derequire'),
    UglifyJS = require('uglify-js'),
    collapse = require('bundle-collapser/plugin'),
    concat = require('source-map-concat'),
    fs = require('fs'),
    path = require('path');


var BANNER = fs.readFileSync(__dirname + '/banner.txt', 'utf8'),
    BANNER_MIN = fs.readFileSync(__dirname + '/banner-min.txt', 'utf8');

var SOURCE_MAP_HEADER = '//# sourceMappingURL=data:application/json;charset=utf-8;base64,';


function extractSourceMap(content) {

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


function Timer() {
  this.reset();
}

Timer.prototype.done = function(message) {
  console.log(message, '[' + (this.now() - this.start) + 'ms]');
  this.reset();
};

Timer.prototype.reset = function() {
  this.start = this.now();
};

Timer.prototype.now = function() {
  return new Date().getTime();
};


module.exports = function(grunt) {

  grunt.registerMultiTask('bundle', function(target) {

    var data = this.data,
        variant = data.name,
        dest = data.dest,
        src = path.resolve(data.src);

    grunt.config.set('config.variant', variant);

    var done = this.async();

    var browserifyOptions = {
      standalone: 'BpmnJS',
      debug: true,
      builtins: false,
      insertGlobalVars: {
        process: function () {
            return 'undefined';
        },
        Buffer: function () {
            return 'undefined';
        }
      }
    };

    var timer = new Timer();

    var targetFileBase = path.join(dest, variant);

    var banner = grunt.template.process(BANNER, grunt.config.get()),
        bannerMin = grunt.template.process(BANNER_MIN, grunt.config.get());

    browserify(browserifyOptions)
      .plugin(derequire)
      .plugin(collapse)
      .add(src)
      .bundle(function(err, result) {

        timer.done('bundled');

        if (err) {
          return done(err);
        }

        var bundled, minified;

        bundled = extractSourceMap(result.toString('utf8'));

        timer.done('extracted source map');

        try {
          minified = uglify(bundled, bannerMin);
        } catch (e) {
          return done(e);
        }

        timer.done('minified');

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

        timer.done('added banner');

        grunt.file.write(targetFileBase + '.js', bannerBundled.code, 'utf8');
        grunt.file.write(targetFileBase + '.js.map', bannerBundled.map, 'utf8');

        grunt.file.write(targetFileBase + '.min.js', minified.code, 'utf8');

        timer.done('all saved');

        done();
      });

  });

};