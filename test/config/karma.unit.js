var path = require('path');

var collectTranslations = process.env.COLLECT_TRANSLATIONS;

var singleStart = process.env.SINGLE_START;

var coverage = process.env.COVERAGE;

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'Safari' ]
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
      'sinon-chai',
      'webpack'
    ],

    files: [
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

    envPreProcessor: [
      'CI'
    ],

    browsers,

    browserNoActivityTimeout: 30000,

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: require.resolve('../TestHelper.js'),
            sideEffects: true
          },
          {
            test: /\.css|\.bpmn$/,
            type: 'asset/source'
          }
        ].concat(
          coverage ? {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                plugins: [
                  [ 'istanbul', {
                    include: [
                      'lib/**'
                    ]
                  } ]
                ],
              }
            }
          } : []
        )
      },
      resolve: {
        mainFields: [
          'dev:module',
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
    config.plugins = [].concat(config.plugins || [ 'karma-*' ], require('./translation-reporter'));
    config.reporters = [].concat(config.reporters || [], 'translation-reporter');
    config.envPreprocessor = [].concat(config.envPreprocessor || [], 'COLLECT_TRANSLATIONS');
  }

  if (singleStart) {
    config.browsers = [].concat(config.browsers, 'Debug');
    config.envPreprocessor = [].concat(config.envPreprocessor || [], 'SINGLE_START');
  }

  karma.set(config);
};
