'use strict';

var path = require('path');

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);


  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      sources: 'app',
      dist: 'dist',
      diagram_js: path.dirname(require.resolve('diagram-js'))
    },

    jshint: {
      src: [
        ['<%=config.sources %>']
      ],
      options: {
        jshintrc: true
      }
    },

    browserify: {
      options: {
        browserifyOptions: {
          // strip unnecessary built-ins
          builtins: [ 'events' ],
          insertGlobalVars: {
            process: function() {
              return 'undefined';
            },
            Buffer: function() {
              return 'undefined';
            }
          }
        },
        transform: [ 'brfs' ]
      },
      watch: {
        options: {
          watch: true
        },
        files: {
          '<%= config.dist %>/app.js': [ '<%= config.sources %>/**/*.js' ]
        }
      },
      app: {
        files: {
          '<%= config.dist %>/app.js': [ '<%= config.sources %>/**/*.js' ]
        }
      }
    },
    copy: {
      app: {
        files: [
          {
            expand: true,
            cwd: '<%= config.sources %>/',
            src: ['**/*.*', '!**/*.js'],
            dest: '<%= config.dist %>'
          },
          {
            src: '<%= config.diagram_js %>/assets/diagram-js.css',
            dest: '<%= config.dist %>/css/diagram-js.css'
          }
        ]
      }
    },
    watch: {
      options: {
        livereload: true
      },
      samples: {
        files: [ '<%= config.sources %>/**/*.*' ],
        tasks: [ 'copy:app' ]
      }
    },
    connect: {
      livereload: {
        options: {
          port: 9013,
          livereload: true,
          hostname: 'localhost',
          open: true,
          base: [
            '<%= config.dist %>'
          ]
        }
      }
    }
  });

  // tasks

  grunt.registerTask('build', [ 'browserify:app', 'copy:app' ]);

  grunt.registerTask('auto-build', [
    'copy',
    'browserify:watch',
    'connect',
    'watch'
  ]);

  grunt.registerTask('default', [ 'jshint', 'build' ]);
};