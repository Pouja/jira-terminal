var Issue = require('../src/plugins/Issue.js');
var issue;

describe('plugin:issue', function() {
    describe('#hook', function() {
        it('Should fail since the handler is unknown', function(done) {
            issue = new Issue({}, {
                _: ['awesome']
            });
            issue.hook().then(function() {
                done('It should fail.');
            }, done);
        });
        it('Should call one of the handlers', function(done) {
            issue = new Issue({}, {
                _: ['awesome']
            });
            issue.awesomeHandler = done;
            issue.hook().then(done, done);
        });
    });
    describe('#getHandler', function() {
        it('Should succeed', function(done) {
            issue = new Issue({
                findIssue: function(arg1, callback) {
                    callback(null, {

                        fields: {
                            summary: '',
                            issuetype: {
                                name: ''
                            },
                            reporter: {
                                name: ''
                            },
                            description: '',
                            status: {
                                name: ''
                            },
                            project: {
                                name: ''
                            }
                        }
                    });
                }
            });
            issue.getHandler().then(done, done);
        });
    });
    describe('#startHandler', function() {
        it('should fail since it misses some arguments', function(done) {
            issue = new Issue({}, {
                _: []
            });
            issue.startHandler().then(function() {
                done('should fail');
            }, done);
        });
        it('should succeed', function(done) {
            issue = new Issue({
                transitionIssue: function(arg1, arg2, callback) {
                    callback(null, '200');
                }
            }, {
                _: [],
                i: 'PIQ-122'
            });
            issue.startHandler().then(done, function() {
                done('It should not fail.');
            });
        });
    });
    describe('#stopHandler', function() {
        it('should fail since it misses some arguments', function(done) {
            issue = new Issue({
                transitionIssue: function(arg1, arg2, callback) {
                    callback(null, '200');
                }
            }, {
                _: []
            });
            issue.stopHandler().then(function() {
                done('should fail');
            }, done);
        });
        it('should succeed', function(done) {
            issue = new Issue({
                transitionIssue: function(arg1, arg2, callback) {
                    callback(null, '200');
                }
            }, {
                _: [],
                i: 'PIQ-122',
                s: 'a',
                m: 'a'
            });
            issue.stopHandler().then(done, function() {
                done('It should not fail.');
            });
        });
    });
});
