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

var pkg = require('../package');

var asyncSeries = require('./helpers').asyncSeries;

var BANNER = fs.readFileSync(__dirname + '/../resources/banner.txt', 'utf8'),
    BANNER_MIN = fs.readFileSync(__dirname + '/../resources/banner-min.txt', 'utf8');

var SOURCE_MAP_HEADER = '//# sourceMappingURL=data:application/json;charset=utf-8;base64,';


module.exports = function bundleAll(targets, done) {

  var fns = Object.keys(targets).map(function(k) {

    var variant = k;
    var entry = targets[k];

    return function(done) {
      console.log('\nbundle ' + variant);

      bundle(variant, entry, done);
    };
  });

  asyncSeries(fns, done);
};


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
  this.reset();
};

Timer.prototype.now = function() {
  return new Date().getTime();
};

function processTemplate(str, args) {
  return str.replace(/\{\{\s*([^\s]+)\s*\}\}/g, function(_, n) {

    var replacement = args[n];

    if (!replacement) {
      throw new Error('unknown template {{ ' + n + '}}');
    }

    return replacement;
  });
}

function pad(n) {
  if (n < 10) {
    return '0' + n;
  } else {
    return n;
  }
}

function today() {
  var d = new Date();

  return [
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDay())
  ].join('-');
}

function bundle(variant, entry, done) {

  var src = path.resolve(entry);
  var dest = 'dist';

  var config = {
    variant: variant,
    version: pkg.version,
    date: today()
  };

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

  var banner = processTemplate(BANNER, config),
      bannerMin = processTemplate(BANNER_MIN, config);

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

          fs.writeFileSync(targetFileBase + '.min.js', minified.code, 'utf8');

          timer.done('saved');

          done();
        });
    },

    // development
    function(done) {
      timer.start('build dev');

      browserify(Object.assign({ debug: true }, browserifyOptions))
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

            fs.writeFileSync(targetFileBase + '.js', bannerBundled.code, 'utf8');
            fs.writeFileSync(targetFileBase + '.js.map', bannerBundled.map, 'utf8');

            timer.done('all saved');
          } catch (e) {
            return done(e);
          }

          done();
        });
    }
  ];

  asyncSeries(fns, done);
}