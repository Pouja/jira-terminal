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
});
