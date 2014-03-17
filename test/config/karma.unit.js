module.exports = function(karma) {
  karma.set({

    basePath: '../../',

    frameworks: [ 'jasmine', 'browserify' ],

    files: [
      'test/spec/**/*Spec.js'
    ],
    
    reporters: [ 'dots' ],

    browsers: [ 'PhantomJS' ],

    singleRun: false,
    autoWatch: true,

    // fixing slow browserify build
    browserNoActivityTimeout: 30000,

    // browserify configuration
    browserify: {
      debug: true,
      watch: true
    },

    preprocessors: {
      'test/spec/**/*Spec.js': [ 'browserify' ]
    }
  });
};
