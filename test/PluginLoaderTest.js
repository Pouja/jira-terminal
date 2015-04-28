var proxyquire = require('proxyquire');
var sinon = require('sinon');


describe('PluginLoader', function() {
    var fsStub = {
        readdirSync: function() {
            return ['Comment.js'];
        }
    };
    var util = {
        help: function() {},
        getPassword: function() {
            return 'secret';
        },
        log: function() {}
    };
    var UtilStub = function() {
        return util;
    };
    var stubFuncs = {};
    var Comment = function() {
        return stubFuncs;
    };
    var PluginLoader = proxyquire('../src/PluginLoader', {
        './plugins/Comment.js': Comment,
        fs: fsStub,
        './Util.js': UtilStub
    });
    describe('#run', function() {
        it('If there are no arguments are sets, Util.help should be called', function() {
            util.help = sinon.spy();
            PluginLoader.run();
            util.help.calledTwice.should.be.ok;
        });
        it('If the argument equals \'help\' Util.help should be called', function() {
            process.argv[2] = 'help';
            util.help = sinon.spy();
            PluginLoader.run();
            util.help.calledTwice.should.be.ok;
        });
        it('should print an error since the plugin name does not match', function() {
            process.argv[2] = 'dude';
            util.error = sinon.spy();
            PluginLoader.run();
            util.error.calledOnce.should.be.ok;
        });
        it('should invoke the plugin in all other cases', function() {
            process.argv[2] = 'comment';
            stubFuncs.pattern = 'comment';
            stubFuncs.hook = sinon.spy();
            PluginLoader.run();
            util.error.calledOnce.should.be.ok;
        });
    });
});
