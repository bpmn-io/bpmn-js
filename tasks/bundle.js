'use strict';

var browserify = require('browserify'),
    derequire = require('browserify-derequire'),
    collapse = require('bundle-collapser/plugin'),
    concat = require('source-map-concat'),
    fs = require('fs'),
    path = require('path'),
    flattenBundle = require('browser-pack-flat/plugin'),
    commonShake = require('common-shakeify'),
    unassertify = require('unassertify'),
    uglify = require('uglify-es');

var assign = Object.assign;

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


function Timer() {
  this.reset();
}

Timer.prototype.done = function(message) {
  console.log(message, '[' + (this.now() - this.s) + 'ms]');
  this.reset();
};

Timer.prototype.reset = function() {
  this.s = this.now();
};

Timer.prototype.start = function(msg) {
  console.log('start: ' + msg);

  this.reset();
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
      builtins: false,
      insertGlobalVars: {
        process: function() {
          return 'undefined';
        },
        Buffer: function() {
          return 'undefined';
        }
      }
    };

    var targetFileBase = path.join(dest, variant);

    var banner = grunt.template.process(BANNER, grunt.config.get()),
        bannerMin = grunt.template.process(BANNER_MIN, grunt.config.get());

    var timer = new Timer();

    var fns = [

      // production
      function(done) {

        timer.start('build prod');

        browserify(browserifyOptions)
          .transform(unassertify)
          .plugin(commonShake)
          .plugin(flattenBundle)
          .plugin(collapse)
          .plugin(derequire)
          .add(src)
          .bundle(function(err, result) {

            timer.done('bundled');

            if (err) {
              return done(err);
            }

            var str = result.toString('utf-8');

            var minified = uglify.minify(str, {
              compress: true,
              mangle: true,
              output: {
                preamble: bannerMin
              }
            });

            timer.done('minified');

            grunt.file.write(targetFileBase + '.min.js', minified.code, 'utf8');

            timer.done('saved');

            done();
          });
      },

      // development
      function(done) {

        timer.start('build dev');

        browserify(assign({ debug: true }, browserifyOptions))
          .plugin(collapse)
          .plugin(derequire)
          .add(src)
          .bundle(function(err, result) {

            timer.done('bundled');

            if (err) {
              return done(err);
            }

            try {
              var bundled = extractSourceMap(result.toString('utf8'));

              timer.done('extracted source map');

              var bannerBundled =
                concat([ bundled ])
                  .prepend(banner + '\n')
                  .add('//# sourceMappingURL=./' + variant + '.js.map')
                  .toStringWithSourceMap();

              timer.done('added banner');

              grunt.file.write(targetFileBase + '.js', bannerBundled.code, 'utf8');
              grunt.file.write(targetFileBase + '.js.map', bannerBundled.map, 'utf8');

              timer.done('all saved');
            } catch (e) {
              return done(e);
            }

            done();
          });
      }
    ];

    function next(err) {

      if (err) {
        return done(err);
      }

      var fn = fns.shift();

      if (!fn) {
        return done();
      } else {
        fn(next);
      }
    }

    next();

  });

};