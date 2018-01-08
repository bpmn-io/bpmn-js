'use strict';

var browserify = require('browserify'),
    derequire = require('browserify-derequire'),
    collapse = require('bundle-collapser/plugin'),
    fs = require('fs'),
    path = require('path'),
    flattenBundle = require('browser-pack-flat/plugin'),
    commonShake = require('common-shakeify'),
    unassertify = require('unassertify'),
    uglify = require('uglify-es'),
    envify = require('envify');

var pkg = require('../package');

var asyncSeries = require('./helpers').asyncSeries;

var BANNER = fs.readFileSync(__dirname + '/../resources/banner.txt', 'utf8'),
    BANNER_MIN = fs.readFileSync(__dirname + '/../resources/banner-min.txt', 'utf8');


module.exports = function bundleAll(dest, targets, done) {

  var fns = Object.keys(targets).map(function(k) {

    var variant = k;
    var entry = targets[k];

    return function(done) {
      console.log('\nbundle ' + variant);

      bundle(dest, variant, entry, done);
    };
  });

  asyncSeries(fns, done);
};



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

function bundle(dest, variant, entry, done) {

  var src = path.resolve(entry);

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
        .transform(envify, {
          NODE_ENV: 'production'
        })
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

          fs.writeFileSync(targetFileBase + '.production.min.js', minified.code, 'utf8');

          timer.done('wrote ' + targetFileBase + '.production.min.js');

          done();
        });
    },

    // development
    function(done) {
      timer.start('build dev');

      browserify(browserifyOptions)
        .transform(envify, {
          NODE_ENV: 'development'
        })
        .plugin(collapse)
        .plugin(derequire)
        .add(src)
        .bundle(function(err, result) {

          timer.done('bundled');

          if (err) {
            return done(err);
          }

          var code = banner + result.toString('utf-8');

          fs.writeFileSync(targetFileBase + '.development.js', code, 'utf8');

          timer.done('wrote ' + targetFileBase + '.development.js');

          done();
        });
    }
  ];

  asyncSeries(fns, done);
}