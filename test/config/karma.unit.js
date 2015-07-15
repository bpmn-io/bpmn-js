'use strict';

module.exports = function(karma) {
  karma.set({

    basePath: '../../',

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
      transform: [ [ 'stringify', { global: true, extensions: [ '.bpmn', '.xml', '.css' ] } ] ]
    }
  });
};
