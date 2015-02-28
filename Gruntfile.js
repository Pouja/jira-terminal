module.exports = function(grunt) {
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-env');

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
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
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                },
                require: ['should'],
                src: ['test/**/*.js']
            }
        },
        env: {
            test: {
                NODE_ENV: 'test',
            }
        },
    });

    grunt.registerTask('default', ['env:test', 'jshint', 'mochaTest']);
};
