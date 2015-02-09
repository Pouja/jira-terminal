'use strict';

module.exports = function(grunt) {
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: ['src/**/*.js']
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/**/*.js']
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                },
                src: ['test/**/*.js']
            }
        }
    });
    grunt.registerTask('default', function() {
        if (process.env.NODE_ENV !== 'test') {
            grunt.log.warn('Please run the tests with NODE_ENV=test to prevent seeing all the pretty tables and logs.');
        } else {
            grunt.task.run(['jshint', 'mochaTest']);
        }
    });
}
