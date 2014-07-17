module.exports = function(karma) {
  karma.set({

    basePath: '../../',

    frameworks: [ 'browserify', 'jasmine' ],

    files: [
      'test/spec/browser/**/*Spec.js'
    ],

    reporters: [ 'dots' ],

    preprocessors: {
      'test/spec/browser/**/*Spec.js': [ 'browserify' ]
    },

    browsers: [ 'PhantomJS' ],

    browserNoActivityTimeout: 15000,

    singleRun: false,
    autoWatch: true,

    // browserify configuration
    browserify: {
      debug: true,
      transform: [ 'brfs' ]
    }
  });
};
