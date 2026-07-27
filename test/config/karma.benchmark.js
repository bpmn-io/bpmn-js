var path = require('path');

var basePath = '../..';

var absoluteBasePath = path.resolve(path.join(__dirname, basePath));

var browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

var suite = 'test/benchmark/huge-diagram.js';


module.exports = function(karma) {
  karma.set({

    basePath,

    frameworks: [
      'mocha',
      'webpack'
    ],

    files: [
      suite
    ],

    preprocessors: {
      [ suite ]: [ 'webpack' ]
    },

    reporters: [ 'tldr' ],

    browsers,

    // benchmark operations block the browser's main thread for
    // seconds at a time (large synchronous copy / move preview), so
    // give karma generous tolerances before it considers the browser
    // unresponsive
    browserNoActivityTimeout: 600000,
    browserDisconnectTimeout: 600000,
    pingTimeout: 600000,

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /test[\\/]benchmark[\\/]/,
            sideEffects: true
          },
          {
            test: /\.css$/,
            type: 'asset/source'
          }
        ]
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
  });
};
