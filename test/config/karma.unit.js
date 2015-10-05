'use strict';

var path = require('path');

var basePath = '../../';

var absoluteBasePath = path.resolve(path.join(__dirname, basePath));


module.exports = function(karma) {
  karma.set({

    basePath: basePath,

    frameworks: [ 'browserify',
                  'mocha',
                  'chai',
                  'sinon-chai'],

    files: [
      'test/spec/**/*Spec.js',
      'test/integration/**/*Spec.js'
    ],

    reporters: [ 'dots' ],

    preprocessors: {
      'test/spec/**/*Spec.js': [ 'browserify' ],
      'test/integration/**/*Spec.js': [ 'browserify' ]
    },

    browsers: [ 'PhantomJS' ],

    browserNoActivityTimeout: 30000,

    singleRun: false,
    autoWatch: true,

    // browserify configuration
    browserify: {
      debug: true,
      paths: [ absoluteBasePath ],
      transform: [ [ 'stringify', { global: true, extensions: [ '.bpmn', '.xml', '.css' ] } ] ]
    }
  });
};
