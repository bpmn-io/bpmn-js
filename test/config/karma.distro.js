// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox' ]
var browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

var VARIANT = process.env.VARIANT;

var NODE_ENV = process.env.NODE_ENV;

var basePath = '../..';

var suite = 'test/distro/' + VARIANT + '.js';


module.exports = function(karma) {
  karma.set({

    basePath,

    frameworks: [
      'mocha',
      'webpack'
    ],

    files: [
      'dist/' + VARIANT + '.' + (NODE_ENV === 'production' ? 'production.min' : 'development') + '.js',
      'dist/assets/bpmn-font/css/bpmn.css',
      'dist/assets/diagram-js.css',
      { pattern: 'resources/initial.bpmn', included: false },
      { pattern: 'dist/assets/**/*', included: false },
      suite
    ],

    preprocessors: {
      [ suite ]: [ 'webpack' ]
    },

    reporters: [ 'progress' ],

    browsers,

    browserNoActivityTimeout: 30000,

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development',
      devtool: 'eval-source-map'
    }
  });

};
