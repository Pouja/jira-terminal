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

describe('First', function() {
    // Disable console.log
    var log = console.log;
    console.log = function() {};
    after(function() {
        console.log = log;
    });

    describe('#run', function() {
        it('Should call keytar and fs correctly', function(done) {
            promptStub.multi = function(questions, cb) {
                questions.should.have.lengthOf(3);
                cb({
                    username: 'test.me',
                    password: 'secret',
                    host: 'example.com'
                });
            };
            fsStub.mkdirSync = function(dir){
                dir.should.be.equal(home + '/' + config.location);
            };
            fsStub.writeFileSync = function(path, file) {
                path.should.be.equal(home + '/' + config.location + config.config);
                file.should.not.have.property('password');
            };
            keytarStub.addPassword = function(profile, username, password){
                profile.should.be.equal('jira-terminal');
                password.should.be.equal('secret');
                username.should.be.equal('test.me');
            };
            First.run(done);
        });
    });
});
