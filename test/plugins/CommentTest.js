// For some reason jshint says that Comment is already defined :/
var CommentConstr = require('../../src/plugins/Comment.js');
var comment;
var argv;
var jiraApi;

describe('plugin:comment', function() {
    describe('#hook', function() {
        before(function(){
            argv = {};
            comment = new CommentConstr({}, argv);
        });
        it('should call add', function(done) {
            argv._ = [null, 'add'];
            comment.add = function() {
                done();
            };
            comment.hook();
        });
        it('should call help', function(done) {
            argv._ = [null, 'help'];
            comment.printHelp = function() {
                done();
            };
            comment.hook();
        });
        it('should call add', function(done) {
            argv._ = [null, 'TEST-1'];
            comment.show = function() {
                done();
            };
            comment.hook();
        });
    });
    describe('#add', function() {
        before(function() {
            argv = {};
            comment = new CommentConstr(jiraApi, argv);
        });
        it('should throw when id is not set', function() {
            (function() {
                comment.add();
            }).should.throw();
        });
    });
    describe('#show', function() {
        it('Should fail when no issue was found matching the id', function() {
        });
        it('should succeed', function() {
        });
    });
});
