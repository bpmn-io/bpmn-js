module.exports = function(karma) {
  karma.set({

    basePath: '../../',

    frameworks: [ 'jasmine', 'browserify' ],

    files: [
      'test/spec/**/*Spec.js'
    ],
    
    reporters: [ 'dots' ],

    preprocessors: {
      'test/spec/**/*Spec.js': [ 'browserify' ]
    },

    browsers: [ 'PhantomJS' ],

    singleRun: false,
    autoWatch: true,

    // browserify configuration
    browserify: {
      debug: true,
      watch: true,
      transform: [ 'debowerify' ]
    }
  });
};
