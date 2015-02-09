'use strict';
var prompt = require('prompt');
var Q = require('q');
var fs = require('fs');
var util = require('util');

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

    var createExec = function(path) {
        var deferred = Q.defer();
        var file = [
            '#!/bin/zsh',
            'node ' + __dirname + '/src/app.js $*',
            ''
        ].join('\n');

        if (path[path.length - 1] !== '/') {
            path += '/';
        }
        var fullPath = path + 'jira-terminal';
        Q.ninvoke(fs, 'writeFile', fullPath, file, 'utf8')
            .then(function() {
                deferred.resolve(fullPath);
            }, deferred.reject);
        return deferred.promise;
    }

    grunt.registerTask('install', function() {
        var done = this.async();

        prompt.start();
        prompt.message = '';
        prompt.delimiter = ':';
        prompt.colors = false;
        var questions = ['installation directory'];


        Q.ninvoke(prompt, 'get', questions)
            .then(function(result) {
                return createExec(result[questions[0]]);
            }).then(function(fullpath) {
                grunt.log.write(util.format('Wrote executable to %s.', fullpath));
                grunt.log.write('You still have to make it executable by for example performing chmod u+x.');
                done();
            }, done);
    });
    grunt.registerTask('default', function() {
        if (process.env.NODE_ENV !== 'test') {
            grunt.log.warn('Please run the tests with NODE_ENV=test to prevent seeing all the pretty tables and logs.');
        } else {
            grunt.task.run(['jshint', 'mochaTest']);
        }
    });
}
