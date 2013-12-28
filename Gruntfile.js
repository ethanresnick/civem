'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        //not a reserved word or anything; 
        //just an object I'm using to store some paths.
        settings: {
            js: 'src/js',
            app: 'src/js/app',
            views: 'src/js/app/views',
            dist: 'build',
            test: 'test'
        },

        cancompile: {
          dist: {
            src: ['<%= settings.views %>/**.mustache'],
            out: '<%= settings.dist %>/views.js',
            wrapper: 'define(["can/view/mustache"], function(can) { {{{content}}} });'
            //tags: ['editor', 'my-component']
          }
        },

        coffee: {
            dist: {
                expand: true,
                cwd: '<%= settings.js %>',
                src: ['**/*.coffee'],
                dest: '<%= settings.dist %>/js',
                ext: '.js'
            },
            test: {
                expand: true,
                cwd: '<%= settings.test %>/.src',
                src: ['**/*.coffee'],
                dest: '<%= settings.test %>/.src',
                ext: '.js'
            }
        },

        copy: {
            dist: {
                files: [
                    {cwd:'<%= settings.js %>', expand: true, flatten:false, src:['**/*.js','*.js'], dest: '<%= settings.dist %>/js'},
                    {src:'src/index.html', dest: '<%= settings.dist %>/index.html'}
                ],
                options: {
                    processContent: function(content, path) {
                        if(path.slice(-4)!=="html") {
                            return content;
                        }

                        return (content.replace("style.css", "style.min.css")).replace(/data-main=\".+?\"/g, '').replace("</script>", "</script><script>require(['app']);</script>");
                    }
                }
            },
            test: {
                files: [
                    {cwd:'<%= settings.js %>', expand: true, flatten:false, src:['**'], dest: '<%= settings.test %>/.src'},
                ]
            }
        },

        requirejs: {
            dist: {
                options: {     
                    /*
                    I have to pick: do I want almond, which can't load jquery
                    from the CDN (so I'd have to minify it into the main file)
                    and loses the caching benefits; or do I want to use the standard
                    require, which is bigger than almond and takes an extra request
                    to load the data-main (though that request should be removable).
                    For now, I'm going with require. 
                    To switch to almond, uncomment the below and switch to the 
                    grunt-require plugin in package.json rather than grunt-contrib-require.
                    
                    almond: true,
                    wrap: true,
                    replaceRequireScript: [{
                         files: ['<%= settings.dist %>/index.html'],
                         module: 'app',
                         modulePath: 'app_module'
                    }],
                    */
                    preserveLicenseComments: false,             
                    paths: {
                        jquery: "empty:",
                        "app/views": '../../views'
                    },
                    optimize: "none",
                    include:["app"],
                    insertRequire: ['app'],
                    baseUrl: "<%= settings.dist %>/js/lib",
                    mainConfigFile: "<%= settings.dist %>/js/app.js",
                    out: "<%= settings.dist %>/app.js"
                }
            }
        },

        uglify: {
            dist: {
                files: {
                    '<%= settings.dist %>/app.js': ['<%= settings.dist %>/app.js']
                }
            }
        },

        cssmin: {
          dist: {
            expand: true,
            cwd: 'src/css',
            src: ['*.css', '!*.min.css'],
            dest: '<%= settings.dist %>/css',
            ext: '.min.css'
          }
        },

        clean: {
            distCompiled: {
                expand: true,
                src: ['<%= settings.dist %>/js/*', '!<%= settings.dist %>/js/lib', '<%= settings.dist %>/views.js']
            },
            distAll: ['<%= settings.dist %>/*'],
            test: ['<%= settings.test %>/.src']
        },

        qunit: {
            all: ['test/*.html', 'test/**/*.html']
        },

        mkdir: {
            dist: {
                options: {
                    create: ['build']
                },
            }
        }
    });

    grunt.loadNpmTasks('can-compile');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('test', ['copy:test', 'coffee:test', 'qunit', 'clean:test']);
    grunt.registerTask('compile', ['cancompile', 'coffee']);
    grunt.registerTask('buildMainJS', ['clean:distAll', 'mkdir:dist', 'compile', 'copy', 'requirejs', 'uglify', 'clean:distCompiled']);
    grunt.registerTask('default', ['buildMainJS', 'cssmin', 'test' /* jshint */]);
    grunt.registerTask('watch', []);
};
     /*
    "grunt-bower-task": "~0.3.2", 
    "grunt-compare-size": "~0.4.0",
    "grunt-contrib-watch": "~0.5.3",
    "grunt-git-authors": "~1.2.0",
    "grunt-jscs-checker": "~0.2.3",
    "load-grunt-tasks": "~0.2.0",
    "testswarm": "~1.1.0",
    "which": "~1.0.5"
}*/