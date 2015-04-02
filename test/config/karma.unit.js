module.exports = function(karma) {
  karma.set({

    basePath: '../../',

    frameworks: [ 'browserify',
                  'mocha',
                  'chai',
                  'sinon-chai'],

    files: [
      'test/spec/**/*Spec.js'
    ],

    preprocessors: {
      'test/spec/**/*Spec.js': [ 'browserify' ]
    },

    reporters: [ 'dots' ],

    browsers: [ 'PhantomJS' ],

    browserNoActivityTimeout: 30000,

    singleRun: false,
    autoWatch: true,

    // browserify configuration
    browserify: {
      debug: true,
      transform: [ 'brfs' ]
    }
  });
};
