'use strict';

var path = require('path');

var basePath = '../../';

var absoluteBasePath = path.resolve(path.join(__dirname, basePath));

/* global process */

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE', 'PhantomJS' ]
var browsers =
  (process.env.TEST_BROWSERS || 'PhantomJS')
    .replace(/^\s+|\s+$/, '')
    .split(/\s*,\s*/g)
    .map(function(browser) {
      if (browser === 'ChromeHeadless') {
        process.env.CHROME_BIN = require('puppeteer').executablePath();

        // workaround https://github.com/GoogleChrome/puppeteer/issues/290
        if (process.platform === 'linux') {
          return 'ChromeHeadless_Linux';
        }
      } else {
        return browser;
      }
    });


module.exports = function(karma) {
  karma.set({

    basePath: basePath,

    frameworks: [
      'browserify',
      'mocha',
      'sinon-chai'
    ],

    files: [
      'test/**/*Spec.js'
    ],

    preprocessors: {
      'test/**/*Spec.js': [ 'browserify', 'env' ]
    },

    reporters: [ 'spec' ],

    customLaunchers: {
      ChromeHeadless_Linux: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ],
        debug: true
      }
    },

    browsers: browsers,

    browserNoActivityTimeout: 30000,

    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
      debug: true,
      paths: [ absoluteBasePath ],
      transform: [
        [ 'stringify', { global: true, extensions: [ '.bpmn', '.xml', '.css' ] } ]
      ]
    }
  });
};
