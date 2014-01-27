module.exports = function(grunt) {

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      single: {

        browsers: [ 'PhantomJS' ],
        autoWatch: false,
        singleRun: true,

        configFile: 'test/config/karma.unit.js',

        browserify: {
          watch: false,
          debug: false,
          transform: [ 'debowerify' ]
        }
      },
      unit: {
        configFile: 'test/config/karma.unit.js',
      
        singleRun: false,
        autoWatch: true,
        browsers: [ 'Chrome' ]
      }
    },
    browserify: {
      vendor: {
        src: [ 'bower_components/snapsvg/index.js', 'node_modules/lodash/lodash.js' ],
        dest: 'build/common.js',
        options: {
          alias: [
            'bower_components/snapsvg/index.js:snapsvg',
            'node_modules/lodash/lodash.js:lodash'
          ]
        }
      },
      src: {
        files: {
          'build/diagram.js': [ 'src/**/*.js' ]
        },
        options: {
          external: [ 'snapsvg', 'lodash' ],
          alias: [
            'src/diagram.js:diagram'
          ]
        }
      }
    },
    watch: {
      browserify: {
        files: [ 'src/**/*.js' ],
        tasks: [ 'browserify' ],
      },
      jsdoc: {
        files: [ 'src/**/*.js', 'test/**/*.js' ],
        tasks: [ 'jsdoc']
      }
    },
    jsdoc: {
      dist: {
        src: [ 'src/**/*.js', 'test/**/*.js' ],
        options: {
          destination: 'doc',
          plugins: [ 'plugins/markdown' ]
        }
      }
    }
  });

  // load external scripts
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.loadNpmTasks('grunt-contrib-watch');

  // register tasks
  grunt.registerTask('test', [ 'karma:single' ]);
  grunt.registerTask('build', [ 'browserify' ]);

  grunt.registerTask('auto-test', [ 'karma:unit' ]);
  grunt.registerTask('auto-build', [ 'browserify', 'watch' ]);

  grunt.registerTask('default', [ 'test', 'build', 'jsdoc' ]);
};