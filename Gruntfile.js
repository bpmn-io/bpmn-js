'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

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
      dist: '../bower-bpmn-js/dist'
    },

    jshint: {
      src: [
        ['<%=config.sources %>']
      ],
      options: {
        jshintrc: true
      }
    },

    release: {
      options: {
        tagName: 'v<%= version %>',
        commitMessage: 'chore(project): release v<%= version %>',
        tagMessage: 'chore(project): tag v<%= version %>'
      }
    },

    karma: {
      options: {
        configFile: '<%= config.tests %>/config/karma.unit.js'
      },
      single: {
        singleRun: true,
        autoWatch: false,

        browsers: TEST_BROWSERS
      },
      unit: {
        browsers: TEST_BROWSERS
      }
    },

    bundle: {
      viewer: {
        name: 'bpmn-viewer',
        src: '<%= config.sources %>/Viewer.js',
        dest: '<%= config.dist %>'
      },
      navigated_viewer: {
        name: 'bpmn-navigated-viewer',
        src: '<%= config.sources %>/NavigatedViewer.js',
        dest: '<%= config.dist %>'
      },
      modeler: {
        name: 'bpmn-modeler',
        src: '<%= config.sources %>/Modeler.js',
        dest: '<%= config.dist %>'
      }
    },

    copy: {
      bpmn_js: {
        files: [
          { expand: true, cwd: 'assets', src: [ '**' ], dest: '<%= config.dist %>/assets' }
        ]
      },

      diagram_js: {
        files: [
          { expand: true, cwd: 'node_modules/diagram-js/assets', src: [ '**' ], dest: '<%= config.dist %>/assets' }
        ]
      }
    }
  });

  grunt.loadTasks('tasks');


  // tasks

  grunt.registerTask('test', [ 'karma:single' ]);

  grunt.registerTask('auto-test', [ 'karma:unit' ]);

  grunt.registerTask('build', [ 'bundle', 'copy' ]);

  grunt.registerTask('default', [ 'jshint', 'test', 'build' ]);
};