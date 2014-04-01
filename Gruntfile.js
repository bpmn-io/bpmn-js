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
      sources: 'src',
      tests: 'test',
      dist: 'build',
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
      vendor: {
        src: [ 'snapsvg', 'lodash' ],
        dest: '<%= config.dist %>/common.js',
        options: {
          debug: true,
          alias: [
            'snapsvg',
            'lodash'
          ]
        }
      },
      src: {
        files: {
          '<%= config.dist %>/diagram.js': [ '<%= config.sources %>/**/*.js' ]
        },
        options: {
          debug: true,
          external: [ 'snapsvg', 'lodash' ],
          alias: [
            '<%= config.sources %>/Diagram.js:diagram'
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
            src: ['*.{js,css,html,png}'],
            dest: '<%= config.dist %>/<%= config.samples %>'
          }
        ]
      },
      fonts:  {
        files: [
          {
            expand: true,
            cwd: '<%= config.fonts %>/',
            src: ['fonts/*.woff'],
            dest: '<%= config.dist %>'
          }
        ]
      }
    },
    watch: {
      sources: {
        files: [ '<%= config.sources %>/**/*.js' ],
        tasks: [ 'concurrent:sources']
      },
      samples: {
        files: [ '<%= config.samples %>/*.{html,css,js}' ],
        tasks: [ 'copy:samples']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.dist %>/*.js',
          '<%= config.dist %>/<%= config.samples %>/*.{html,css,js}'
        ]
      }
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
    jsdoc: {
      dist: {
        src: [ '<%= config.sources %>/**/*.js' ],
        options: {
          destination: 'doc',
          plugins: [ 'plugins/markdown' ]
        }
      }
    },
    concurrent: {
      'sources': [ 'browserify:src', 'jshint' ],
      'build': [ 'jshint', 'build', 'jsdoc' ]
    }
  });

  // tasks
  
  grunt.registerTask('test', [ 'karma:single' ]);
  grunt.registerTask('build', [ 'browserify', 'copy' ]);

  grunt.registerTask('auto-test', [ 'karma:unit' ]);

  grunt.registerTask('auto-build', [
    'concurrent:build',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('default', [ 'test', 'build', 'jsdoc' ]);
};