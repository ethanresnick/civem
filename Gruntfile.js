
'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        requirejs: {
            compile: {
                options: {
                    appDir: "src",
                    baseUrl: "js/lib",
                    mainConfigFile: "src/js/app.js",
                    dir: "./build",
                    paths: {
                        jquery: "empty:"
                    },
                    modules: [{
                        name: "app"
                    }], 
                    preserveLicenseComments: false,
                    done: function(done, output) {

                        var duplicates = require('rjs-build-analysis').duplicates(output);

                        if (duplicates.length > 0) {
                            grunt.log.subhead('Duplicates found in requirejs build:');
                            grunt.log.warn(duplicates);
                            done(new Error('r.js built duplicate modules, please check the excludes option.'));
                        }

                        done();
                    }
                }
            }
        },

        cssmin: {
          minify: {
            expand: true,
            cwd: 'src/css',
            src: ['*.css', '!*.min.css'],
            dest: 'build/css',
            ext: '.min.css'
          }
        },

        qunit: {
            all: ['test/*.html', 'test/**/*.html']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('test', ['qunit']);
    grunt.registerTask('default', [/* jshint, */ 'test', 'requirejs' /* build */]);
};
  /*"main": "dist/jquery.js",*/
     /*
    "grunt-bower-task": "~0.3.2", 
    "grunt-cli": "~0.1.11",
    "grunt-compare-size": "~0.4.0",
    "grunt-contrib-jshint": "~0.7.0",
    "grunt-contrib-uglify": "~0.2.7",
    "grunt-contrib-watch": "~0.5.3",
    "grunt-git-authors": "~1.2.0",
    "grunt-jscs-checker": "~0.2.3",
    "grunt-jsonlint": "~1.0.1",
    "load-grunt-tasks": "~0.2.0",
    "testswarm": "~1.1.0",
    "requirejs": "~2.1.9",
    "which": "~1.0.5" */
    /*
  "scripts": {
    "build": "npm install && grunt",

    "start": "grunt watch",
    "test": "grunt"
  }
}*/