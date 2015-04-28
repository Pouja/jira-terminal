var proxyquire = require('proxyquire').noPreserveCache();
var fsStub = {
    readFileSync: function() {}
};

var Config = proxyquire('../src/Config.js', {
    fs: fsStub
});

describe('Config', function() {
    describe('#load', function() {
        var originalEnv = process.env.NODE_ENV;

        afterEach(function() {
            process.env.NODE_ENV = originalEnv;
        });
        it('should load the test config when env is set to test', function() {
            Config.load().host.should.equal('jira.awesome.com');
            Config.load().username.should.equal('john.doe');
        });
        it('Should load the default config when env is set to anything but test', function() {
            process.env.NODE_ENV = 'blaat';
            fsStub.readFileSync = function() {
                return '{"test":1}';
            };
            Config.load().should.have.property('test').with.equal(1);
        });
    });
    describe('#exists', function() {
        it('Should throw error when fetching or parsing fails due not ENOENT', function() {
            fsStub.readFileSync = function() {
                throw {
                    code: 'TEST'
                };
            };
            (function() {
                Config.exists();
            }).should.throw();
        });
        it('Should return false when throwing an error with code ENOENT', function() {
            fsStub.readFileSync = function() {
                throw {
                    code: 'ENOENT'
                };
            };
            Config.exists().should.be.equal(false);
        });
        it('Should return true when parsing and reading succeeds', function() {
            fsStub.readFileSync = function() {
                return '{"test":1}';
            };
            Config.exists().should.be.equal(true);
        });
    });
});
