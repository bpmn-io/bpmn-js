module.exports = function(karma) {
  karma.set({

    basePath: '../../',

    frameworks: [ 'browserify', 'jasmine' ],

    files: [
      'test/spec/**/*Spec.js'
    ],

    preprocessors: {
      'test/spec/**/*Spec.js': [ 'browserify' ]
    },

    reporters: [ 'dots' ],

    browsers: [ 'PhantomJS' ],

    singleRun: false,
    autoWatch: true,

    // browserify configuration
    browserify: {
      debug: true
    }
  });
};
