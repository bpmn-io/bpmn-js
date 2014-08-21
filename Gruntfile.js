module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  /* global Buffer,process*/

  // configures browsers to run test against
  // any of [ 'PhantomJS', 'Chrome', 'Firefox', 'IE']
  var TEST_BROWSERS = ((process.env.TEST_BROWSERS || '').replace(/^\s+|\s+$/, '') || 'PhantomJS').split(/\s*,\s*/g);


  function extractSourceMap(file) {
    var content = grunt.file.read(file, { encoding: 'utf-8' });

    var match = /\/\/# sourceMappingURL=data:application\/json;base64,(.*)/.exec(content);

    if (match) {
      var b = new Buffer(match[1] + '==', 'base64');
      var s = b.toString();

      s = s.replace(/\\\\/g, '/'); // convert \\ -> /

      var dir = __dirname;

      var dirPattern = dir.replace(/\\/g, '/').replace(/\./g, '\\.') + '/';

      var pattern = new RegExp(dirPattern, 'g');

      s = s.replace(pattern, '');

      grunt.file.write('tmp/sourceMap.json', s, { encoding: 'utf-8' });

      return 'tmp/sourceMap.json';
    } else {
      return null;
    }
  }

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      sources: 'lib',
      tests: 'test',
      dist: 'dist',
      bowerDist: '../bower-bpmn-js'
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

    browserify: {
      options: {
        browserifyOptions: {
          builtins: false
        },
        bundleOptions: {
          detectGlobals: false,
          insertGlobalVars: [],
          debug: true
        }
      },
      bowerViewer: {
        files: {
          '<%= config.bowerDist %>/bpmn-viewer.js': [ '<%= config.sources %>/Viewer.js' ]
        },
        options: {
          browserifyOptions: {
            builtins: false
          },
          bundleOptions: {
            standalone: 'BpmnJS',
            detectGlobals: false,
            insertGlobalVars: [],
            debug: false
          },
          transform: [
            [ 'exposify', {
              global: true,
              expose: {
                sax: 'sax',
                snapsvg: 'Snap',
                lodash: '_',
                jquery: '$',
                'jquery-mousewheel': '$'
              }
            } ]
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
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> - ' +
                'http://bpmn.io/license - ' +
                'https://github.com/bpmn-io/bpmn-js */',
        sourceMap: true,
        sourceMapIncludeSources: true,
        sourceMapIn: function(file) {
          return extractSourceMap(file);
        }
      },
      bowerViewer: {
        files: {
          '<%= config.bowerDist %>/bpmn-viewer.min.js': [ '<%= config.bowerDist %>/bpmn-viewer.js' ]
        }
      }
    }
  });

  // tasks

  grunt.registerTask('test', [ 'karma:single' ]);

  /////
  //
  // the main build task that bundles bpmn-js files
  //
  // valid executions are
  //
  //   * build -> build:all
  //   * build:all -> build:bower
  //   * build:bower
  //
  grunt.registerTask('build', function(target) {

    if (target === 'bower') {
      return grunt.task.run([ 'browserify:bowerViewer', 'uglify:bowerViewer' ]);
    }

    if (!target || target === 'all') {
      return grunt.task.run([ 'build:bower' ]);
    }
  });

  grunt.registerTask('auto-test', [ 'karma:unit' ]);

  grunt.registerTask('default', [ 'jshint', 'test', 'build', 'jsdoc' ]);
};