module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  /* global process */

  // configures browsers to run test against
  // any of [ 'PhantomJS', 'Chrome', 'Firefox', 'IE']
  var TEST_BROWSERS = ((process.env.TEST_BROWSERS || '').replace(/^\s+|\s+$/, '') || 'PhantomJS').split(/\s*,\s*/g);


  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      sources: 'lib',
      tests: 'test',
      dist: 'dist',
      fonts: 'bower_components/font-awesome',
      samples: 'example'
    },

    release: {
      options: {
        tagName: 'v<%= version %>',
        commitMessage: 'chore(project): release v<%= version %>',
        tagMessage: 'chore(project): tag v<%= version %>'
      }
    },

    jshint: {
      src: ['<%= config.sources %>'],

      options: {
        jshintrc: true,
        ignores: [ '<%= config.sources %>/util/EventEmitter.js' ]
      }
    },

    karma: {
      options: {
        configFile: '<%= config.tests %>/config/karma.unit.js',
      },
      single: {
        singleRun: true,
        autoWatch: false,

        browsers: TEST_BROWSERS,

        browserify: {
          watch: false,
          debug: true
        }
      },
      unit: {
        browsers: TEST_BROWSERS,
        debug: true
      }
    },
    browserify: {
      bower: {
        files: {
          '../bower-diagram-js/diagram.js': [ '<%= config.sources %>/**/*.js' ]
        },
        options: {
          external: [ 'node_modules/snapsvg', 'node_modules/lodash' ],
          alias: [
            '<%= config.sources %>/Diagram.js:diagram-js'
          ]
        }
      },
      standalone: {
        files: {
          '<%= config.dist %>/diagram.js': [ '<%= config.sources %>/**/*.js' ]
        },
        options: {
          debug: true,
          alias: [
            '<%= config.sources %>/Diagram.js:diagram-js'
          ]
        }
      }
    },
    jsdoc: {
      dist: {
        src: [ '<%= config.sources %>/**/*.js' ],
        options: {
          destination: 'docs/api',
          plugins: [ 'plugins/markdown' ]
        }
      }
    }
  });

  // tasks

  grunt.registerTask('test', [ 'karma:single' ]);

  grunt.registerTask('build', function(target) {
    var tasks = [ 'browserify:standalone' ];

    if (target === 'all') {
      tasks.push('browserify:bower');
    }

    return grunt.task.run(tasks);
  });

  grunt.registerTask('auto-test', [ 'karma:unit' ]);

  grunt.registerTask('default', [ 'jshint', 'test', 'build', 'jsdoc' ]);
};