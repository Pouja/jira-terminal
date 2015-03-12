// For some reason jshint says that Comment is already defined :S
var CommentConstr = require('../src/plugins/Comment.js');
var comment;
var assert = require('assert');

describe('plugin:comment', function() {
    describe('#hook', function() {
        var argv = {};
        comment = new CommentConstr({}, argv);
        it('should call add', function(done){
            argv._ = [null, 'add'];
            comment.add = function(){
                done();
            };
            comment.hook();
        });
        it('should call help', function(done){
            argv._ = [null, 'help'];
            comment.printHelp = function(){
                done();
            };
            comment.hook();
        });
        it('should call add', function(done){
            argv._ = [null, 'TEST-1'];
            comment.show = function(){
                done();
            };
            comment.hook();
        });
    });
    describe('#add', function(){
        it('should throw when id is not set', function(){
            assert(false);
        });
        it('it should not call jiraApi.addComment when body is empty', function(){
            assert(false);
        });
        it('should succeed when id is set correclty and body is not empty', function(){
            assert(false);
        });
    });
    describe('#show', function(){
        it('Should fail when no issue was find matching the id', function(){
            assert(false);
        });
        it('should succeed', function(){
            assert(false);
        });
    });
});
