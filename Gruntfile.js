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
          ],
          transform: [ 'uglifyify' ]
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
          ],
          transform: [ 'uglifyify' ]
        }
      }
    },
    watch: {
      browserify: {
        files: [ 'src/**/*.js' ],
        tasks: [ 'browserify' ],
      }
    }
  });

  // load external scripts
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.loadNpmTasks('grunt-contrib-watch');

  // register tasks
  grunt.registerTask('test', [ 'karma:unit' ]);
  grunt.registerTask('build', [ 'browserify' ]);
  grunt.registerTask('dev', [ 'browserify', 'watch' ]);

  grunt.registerTask('default', [ 'test' ]);
};