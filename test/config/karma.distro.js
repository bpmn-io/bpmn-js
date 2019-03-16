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
      }

      return browser;
    });


var VARIANT = process.env.VARIANT;

var NODE_ENV = process.env.NODE_ENV;

var IS_MODULE = (process.env.IS_MODULE == 'true');

module.exports = function(karma) {
  karma.set({

    basePath: '../../',

    frameworks: [
      'mocha',
      'sinon-chai'
    ],

    files: [
      { pattern: 'dist/' + VARIANT + '.' + (NODE_ENV === 'production' ? 'production.min' : 'development') + '.js', type: IS_MODULE ? 'module' : 'js' },
      'dist/assets/bpmn-font/css/bpmn.css',
      'dist/assets/diagram-js.css',
      { pattern: 'resources/initial.bpmn', included: false },
      { pattern: 'dist/assets/**/*', included: false },
      'test/distro/helper.js',
      { pattern: 'test/distro/' + VARIANT + (IS_MODULE ? '.' + (NODE_ENV === 'production' ? 'production.min' : 'development') : '') + '.js', type: IS_MODULE ? 'module' : 'js' }
    ],

    reporters: [ 'progress' ],

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
