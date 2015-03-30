module.exports = function(grunt) {
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-blanket');
    grunt.loadNpmTasks('grunt-env');

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish'),
            },
            all: {
                src: ['Gruntfile.js', 'src/**/*.js']
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/**/*.js']
            }
        },
        clean: {
            coverage: {
                src: ['coverage/']
            }
        },
        copy: {
            config: {
                src: ['config.json'],
                dest: 'coverage/'
            },
            coverage: {
                expand: true,
                src: ['test/**'],
                dest: 'coverage/'
            }
        },
        blanket: {
            coverage: {
                src: ['src/'],
                dest: 'coverage/src/'
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                },
                src: ['coverage/test/**/*.js']
            },
            coverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: 'coverage.html'
                },
                src: ['coverage/test/**/*.js']
            },
            'travis-cov': {
                options: {
                    reporter: 'travis-cov'
                },
                src: ['coverage/test/**/*.js']
            }
        },
        env: {
            test: {
                NODE_ENV: 'test',
            }
        },
    });

    grunt.registerTask('default', ['env:test', 'jshint' ,'clean', 'blanket', 'copy', 'mochaTest']);
};
