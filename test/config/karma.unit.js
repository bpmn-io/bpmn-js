var path = require('path');

var collectTranslations = process.env.COLLECT_TRANSLATIONS;

var singleStart = process.env.SINGLE_START;

var coverage = process.env.COVERAGE;

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE', 'PhantomJS' ]
var browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

var basePath = '../..';

var absoluteBasePath = path.resolve(path.join(__dirname, basePath));

var suite = coverage ? 'test/coverageBundle.js' : 'test/testBundle.js';


module.exports = function(karma) {

  var config = {

    basePath,

    frameworks: [
      'mocha',
      'sinon-chai'
    ],

    files: [
      'node_modules/promise-polyfill/dist/polyfill.js',
      suite
    ],

    preprocessors: {
      [ suite ]: [ 'webpack', 'env' ]
    },

    reporters: [ 'progress' ].concat(coverage ? 'coverage' : []),

    coverageReporter: {
      reporters: [
        { type: 'lcov', subdir: '.' }
      ]
    },

    browsers,

    browserNoActivityTimeout: 30000,

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.css|\.bpmn$/,
            use: 'raw-loader'
          }
        ].concat(coverage ?
          {
            test: /\.js$/,
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true }
            },
            include: /lib\.*/,
            exclude: /node_modules/
          } : []
        )
      },
      resolve: {
        mainFields: [
          'dev:module',
          'browser',
          'module',
          'main'
        ],
        modules: [
          'node_modules',
          absoluteBasePath
        ]
      },
      devtool: 'eval-source-map'
    }
  };

  if (collectTranslations) {
    config.plugins = [].concat(config.plugins || ['karma-*'], require('./translation-reporter'));
    config.reporters = [].concat(config.reporters || [], 'translation-reporter');
    config.envPreprocessor = [].concat(config.envPreprocessor || [], 'COLLECT_TRANSLATIONS');
  }

  if (singleStart) {
    config.browsers = [].concat(config.browsers, 'Debug');
    config.envPreprocessor = [].concat(config.envPreprocessor || [], 'SINGLE_START');
  }

  karma.set(config);
};
