var Util;
var assert = require('assert');
var should = require('should');

describe('Util', function() {
    beforeEach(function() {
        Util = require('../src/Util.js')();
    });
    describe('#help', function() {
        it('Should call log with the correct table', function() {
            Util.log = function(result) {
                result.should.have.lengthOf(0);
            };
            Util.help([]);
        });
    });
    describe('#createAsciiTable', function() {
        it('Should call log with the correct table', function() {
            Util.log = function(result) {
                result.should.have.type('string');
                result.should.not.have.lengthOf(0);
            };
            Util.createAsciiTable({
                row: ['a single row']
            });
        });
        it('Should do nothing when head or rows is not set', function(done) {
            Util.log = function() {
                done('I should not be called');
            };
            Util.createAsciiTable();
            done();
        });
    });
    describe('#setLinebreaks', function() {
        it('Should correctly break the sentence with enters', function() {
            var result = Util.setLinebreaks('abds asdf as', null, 3);
            result.indexOf('\n').should.equal(4);
        });
        it('Should apply no breaks since the sentences are short enough', function() {
            var result = Util.setLinebreaks('abds asdf as', null, 100);
            result.indexOf('\n').should.equal(-1);
        });
    });
    describe('#_filter', function() {
        it('Should throw when an boolean is given as filter', function() {
            (function() {
                Util._filter({});
            }).should.throw();
        });
        it('Should throw when an zero length string is given as filter', function() {
            (function() {
                Util._filter({}, '');
            }).should.throw();
        });
        it('Should filter in a single column when \':\' is present', function() {
            var table = {
                head: ['column1', 'column2'],
                rows: [
                    ['r1c1', 'r1c2'],
                    ['r2c1', 'r2c2']
                ]
            };
            Util._filter(table, 'column1:r1c1');
            table.head.should.have.lengthOf(2);
            table.rows.should.have.lengthOf(1);
        });
        it('Should filter on all columsn \':\' is not present.', function() {
            var table = {
                rows: [
                    ['r1c1', 'r1c2'],
                    ['r2c2', 'r2c2']
                ]
            };
            Util._filter(table, 'r1c1');
            table.rows.should.have.lengthOf(1);
        });
    });
    describe('#_sort', function() {
        it('Should not do anything when the given column name does not exist', function() {
            var table = {
                head: ['column1', 'column2'],
                rows: [
                    ['r2c2', 'r2c2'],
                    ['r1c1', 'r1c2']
                ]
            };
            Util._sort(table, 'column3');
            table.rows[0][0].should.equal('r2c2');
        });
        it('Should sort on the given column name', function() {
            var table = {
                head: ['column1', 'column2'],
                rows: [
                    ['r2c2', 'r2c2'],
                    ['r1c1', 'r1c2']
                ]
            };
            Util._sort(table, 'column1');
            should.deepEqual(table.rows[0], ['r1c1', 'r1c2']);
        });
    });
    describe('#makeIssueLink', function() {
        beforeEach(function(){
            Util = require('../src/Util.js')({});
        });
        it('Should give a pretty link with string as argument', function() {
            Util.makeIssueLink('TEST-1').should.equal('https://jira.awesome.com/browse/TEST-1');
        });
        it('Should give a pretty link with object as argument', function() {
            Util.makeIssueLink({
                key: 'TEST-1'
            }).should.equal('https://jira.awesome.com/browse/TEST-1');
        });
        it('Should throw on all other types of argument', function() {
            (function(){
                Util.makeIssueLink(true);
            }).should.throw();
        });
    });
    describe('#branch', function() {
        var argv = {};
        beforeEach(function() {
            Util = require('../src/Util.js')(argv);
        });
        it('Should do nothing when branch flag is not set', function() {
            Util.makeBranch = function() {
                assert(false, 'I should not be called');
            };
            Util.branch();
        });
        it('Should call make a branch name with only the key and summary', function() {
            argv = {
                branch: true
            };
            Util.makeBranch = function(branchName) {
                branchName.should.equal('TEST-a-small-summary');
            };
            Util.branch({
                key: 'TEST',
                fields: {
                    summary: 'a small summary'
                }
            });
        });
        it('Should make the correct branch name without special characters', function() {
            argv = {
                branch: true
            };
            Util.makeBranch = function(branchName) {
                branchName.should.equal('TEST-a-small-2summary');
            };
            Util.branch({
                key: 'TEST',
                fields: {
                    summary: 'a \'small *2!$#summary @)'
                }
            });
        });
        it('Should make the correct branch name without slash characters', function() {
            argv = {
                branch: true
            };
            Util.makeBranch = function(branchName) {
                branchName.should.equal('TEST-a-small-summary');
            };
            Util.branch({
                key: 'TEST',
                fields: {
                    summary: 'a small /summary'
                }
            });
        });
        it('Should shorten correctly', function() {
            argv = {
                branch: true
            };
            Util.makeBranch = function(branchName) {
                branchName.should.equal('TEST-a-small-summary-with-a-very-long-sentence-uhm-i');
            };
            Util.branch({
                key: 'TEST',
                fields: {
                    summary: 'a small summary with a very long sentence uhm i dont know'
                }
            });
        });
        it('Should make the correct branch name with the correct type', function() {
            argv = {
                branch: true
            };
            Util.makeBranch = function(branchName) {
                branchName.should.equal('bugfix/TEST-a-small-2summary');
            };
            Util.branch({
                key: 'TEST',
                fields: {
                    summary: 'a \'small *2!$#summary @)',
                    issuetype: {
                        name: 'Awesome'
                    }
                }
            });
        });
    });
});
