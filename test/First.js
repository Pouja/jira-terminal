var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var config = require('config');
var proxyquire = require('proxyquire').noCallThru();
var promptStub = {
    multi: function() {}
};
var keytarStub = {
    addPassword: function() {}
};
var fsStub = {
    mkdirSync: function() {},
    writeFileSync: function() {}
};

var First = proxyquire('../src/First.js', {
    'cli-prompt': promptStub,
    keytar: keytarStub,
    fs: fsStub
});
var sinon = require('sinon');

describe('First', function() {
    describe('#run', function() {
        it('Should call keytar and fs correctly', function() {
            promptStub.multi = function(questions, cb) {
                cb({
                    username: 'test.me',
                    password: 'secret',
                    host: 'example.com'
                });
            };
            fsStub.mkdirSync = sinon.spy();
            fsStub.writeFileSync = sinon.spy();
            keytarStub.addPassword = sinon.spy();
            First.run(function() {});

            fsStub.mkdirSync.calledWith(home + '/' + config.location).should.be.ok;
            keytarStub.addPassword.calledWith('jira-terminal', 'test.me', 'secret').should.be.ok;
            fsStub.writeFileSync.calledWith(home + '/' + config.location + config.config).should.be.ok;
            fsStub.writeFileSync.calledWith(sinon.match.any, sinon.match.has('password')).should.fail;
        });
    });
});
