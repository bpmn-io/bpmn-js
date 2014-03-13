module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      sources: 'lib',
      tests: 'test',
      dist: 'dist',
      samples: 'example'
    },

    jshint: {
      src: [
        ['<%=config.sources %>']
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        jshintrc: true
      }
    },
    jasmine_node: {
      specNameMatcher: '.*Spec',
      projectRoot: 'test/spec/node',
      jUnit: {
        report: true,
        savePath : 'tmp/reports/jasmine',
        useDotNotation: true,
        consolidate: true
      }
    },
    karma: {
      options: {
        configFile: '<%= config.tests %>/config/karma.unit.js'
      },
      single: {
        singleRun: true,
        autoWatch: false,

        browsers: ['PhantomJS'],

        browserify: {
          watch: false,
          debug: false
        }
      },
      unit: {
        browsers: [ 'Chrome' ]
      }
    },
    browserify: {
      options: {
        alias: [
          '<%= config.sources %>/main.js:bpmn',
          '<%= config.sources %>/Model.js:bpmn/Model'
        ]
      },
      sources: {
        files: {
          '<%= config.dist %>/bpmn.js': [ '<%= config.sources %>/**/*.js' ]
        },
        options: {
          debug: true,
          transform: [ 'debowerify' ]
        }
      },
      dist: {
        files: {
          '<%= config.dist %>/bpmn.js': [ '<%= config.sources %>/**/*.js' ]
        },
        options: {
          debug: false,
          transform: [ 'debowerify', 'uglifyify' ]
        }
      }
    },
    copy: {
      samples: {
        files: [
          // copy sample files
          {
            expand: true,
            cwd: '<%= config.samples %>/',
            src: ['*.{js,css,html,png}'],
            dest: '<%= config.dist %>/<%= config.samples %>'
          }
        ]
      }
    },
    watch: {
      sources: {
        files: [ '<%= config.sources %>/**/*.js', '<%= config.samples %>/**/*.*' ],
        tasks: [ 'browserify:sources', 'copy:samples' ]
      },
      samples: {
        files: [ '<%= config.samples %>/**/*.*' ],
        tasks: [ 'copy:samples' ]
      },
      jasmine_node: {
        files: [ '<%= config.sources %>/**/*.js', '<%= config.tests %>/spec/node/**/*.js' ],
        tasks: [ 'jasmine_node' ]
      }
    },
    jsdoc: {
      dist: {
        src: [ '<%= config.sources %>/**/*.js' ],
        options: {
          destination: 'docs',
          plugins: [ 'plugins/markdown' ]
        }
      }
    },
    concurrent: {
      'sources': [ 'browserify:sources', 'jshint' ],
      'build': [ 'jshint', 'build', 'jsdoc' ]
    },
    connect: {
      options: {
        port: 9003,
        livereload: 35726,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          open: true,
          base: [
            '<%= config.dist %>'
          ]
        }
      }
    }
  });

  // tasks
  
  grunt.registerTask('test', [ 'jasmine_node', 'karma:single' ]);
  grunt.registerTask('build', [ 'browserify:dist', 'copy:samples' ]);

  grunt.registerTask('auto-build', [
    'concurrent:sources',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('auto-test', [ 'jasmine_node', 'watch:jasmine_node' ]);

  grunt.registerTask('default', [ 'jshint', 'test', 'build', 'jsdoc' ]);
};