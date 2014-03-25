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
          debug: false,
          transform: [ 'brfs' ]
        }
      },
      unit: {
        browsers: [ 'Chrome' ]
      }
    },
    browserify: {
      options: {
        insertGlobalVars: []
      },
      modeler: {
        files: {
          '<%= config.dist %>/bpmn.js': [ '<%= config.sources %>/**/*.js' ]
        },
        options: {
          alias: [
            '<%= config.sources %>/main.js:bpmn',
            '<%= config.sources %>/Model.js:bpmn/Model',
            '<%= config.sources %>/Viewer.js:bpmn/Viewer',
            '<%= config.sources %>/Modeler.js:bpmn/Modeler'
          ],
        }
      },
      viewer: {
        files: {
          '<%= config.dist %>/bpmn-viewer.js': [ '<%= config.sources %>/lib/Viewer.js' ]
        },
        options: {
          alias: [
            '<%= config.sources %>/main.js:bpmn',
            '<%= config.sources %>/Model.js:bpmn/Model',
            '<%= config.sources %>/Viewer.js:bpmn/Viewer'
          ]
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
            src: ['**/*.{js,css,html,png}'],
            dest: '<%= config.dist %>/<%= config.samples %>'
          }
        ]
      }
    },
    watch: {
      sources: {
        files: [ '<%= config.sources %>/**/*.js' ],
        tasks: [ 'build:lib:dev' ]
      },
      samples: {
        files: [ '<%= config.samples %>/**/*.*' ],
        tasks: [ 'build:samples' ]
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
          destination: 'docs/api',
          plugins: [ 'plugins/markdown' ]
        }
      }
    },
    concurrent: {
      'lib': [ 'build:lib', 'jshint' ],
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

  grunt.registerTask('build', function(target, mode) {

    if (mode === 'dev') {
      grunt.config.set('browserify.options.debug', true);
    } else {
      grunt.config.set('browserify.options.transform', [ 'uglifyify' ]);
    }

    if (target === 'lib') {
      return grunt.task.run([ 'browserify:modeler', 'browserify:viewer' ]);
    }

    if (target === 'samples') {
      return grunt.task.run(['copy:samples']);
    }

    if (!target || target === 'all') {
      return grunt.task.run([ 'build:lib', 'build:samples' ]);
    }
  });

  grunt.registerTask('auto-build', [
    'build:all:dev',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('auto-test', [ 'jasmine_node', 'watch:jasmine_node' ]);

  grunt.registerTask('default', [ 'jshint', 'test', 'build', 'jsdoc' ]);
};