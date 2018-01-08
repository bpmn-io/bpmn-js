'use strict';

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


var VARIANT = process.env.VARIANT;

var NODE_ENV = process.env.NODE_ENV;

module.exports = function(karma) {
  karma.set({

    basePath: '../../',

    frameworks: [
      'mocha',
      'sinon-chai'
    ],

    files: [
      `dist/${VARIANT}.${NODE_ENV === 'production' ? 'production.min' : 'development'}.js`,
      'dist/assets/bpmn-font/css/bpmn.css',
      'dist/assets/diagram-js.css',
      { pattern: 'resources/initial.bpmn', included: false },
      { pattern: 'dist/assets/**/*', included: false },
      'test/distro/helper.js',
      `test/distro/${VARIANT}.js`
    ],

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
    autoWatch: false
  });

};
