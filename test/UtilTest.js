var Util = require('../src/Util.js')();
var assert = require('assert');
var should = require('should');
should();

describe('Util', function() {
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
            (function(){
                Util._filter({});
            }).should.throw();
        });
        it('Should throw when an zero length string is given as filter', function() {
            (function(){
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
        it('Should give a pretty link with string as argument', function() {
            assert(false);
        });
        it('Should give a pretty link with object as argument', function() {
            assert(false);
        });
        it('Should throw on all other types of argument', function() {
            assert(false);
        });
    });
    describe('#makeVerticalRows', function() {
        it('Should make a correct vertical table', function() {
            assert(false);
        });
    });
    describe('#branch', function() {
        beforeEach(function(){
            Util = require('../src/Util.js')();
        });
        it('Should do nothing when branch flag is not set', function() {
            Util.makeBranch = function(){
                assert(false, 'I should not be called');
            };
            Util.branch();
        });
        it('Should call make branch and checkout with the correct arguments', function() {
            assert(false);
        });
    });
});
