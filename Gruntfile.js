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
        insertGlobalVars: [],
        debug: true
      },
      modeler: {
        files: {
          '<%= config.dist %>/bpmn.js': [ '<%= config.sources %>/**/*.js' ]
        },
        options: {
          alias: [
            'lodash',
            '<%= config.sources %>/main.js:bpmn',
            '<%= config.sources %>/Model.js:bpmn/Model',
            '<%= config.sources %>/Viewer.js:bpmn/Viewer',
            '<%= config.sources %>/Modeler.js:bpmn/Modeler'
          ]
        }
      },
      viewer: {
        files: {
          '<%= config.dist %>/bpmn-viewer.js': [ '<%= config.sources %>/lib/Viewer.js' ]
        },
        options: {
          alias: [
            'lodash',
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
            src: ['**/*.*'],
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
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> - ' +
                'https://github.com/bpmn-io/bpmn-js */',
        sourceMap: true,
        sourceMapIncludeSources: true,
        sourceMapIn: function(file) {
          var content = grunt.file.read(file, { encoding: 'utf-8' });

          var match = /\/\/# sourceMappingURL=data:application\/json;base64,(.*)/.exec(content);

          if (match) {
            var b = new Buffer(match[1] + '==', 'base64');
            var s = b.toString();

            grunt.file.write('tmp/sourceMap.json', s, { encoding: 'utf-8' });

            return 'tmp/sourceMap.json';
          } else {
            return null;
          }
        }
      },
      modeler: {
        files: {
          '<%= config.dist %>/bpmn.min.js': [ '<%= config.dist %>/bpmn.js' ]
        }
      },
      viewer: {
        files: {
          '<%= config.dist %>/bpmn-viewer.min.js': [ '<%= config.dist %>/bpmn-viewer.js' ]
        }
      }
    }
  });

  // tasks
  
  grunt.registerTask('test', [ 'jasmine_node', 'karma:single' ]);

  grunt.registerTask('build', function(target, mode) {

    mode = mode || 'prod';

    if (target === 'lib') {
      var tasks = [];

      if (mode !== 'dev') {
        tasks.push('uglify:modeler', 'uglify:viewer');
      }

      return grunt.task.run([ 'browserify:modeler', 'browserify:viewer' ].concat(tasks));
    }

    if (target === 'samples') {
      return grunt.task.run(['copy:samples']);
    }

    if (!target || target === 'all') {
      return grunt.task.run([ 'build:lib:' + mode, 'build:samples:' + mode ]);
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