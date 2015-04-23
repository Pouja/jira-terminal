// Necessary since the config package uses process.cwd()
process.env.NODE_CONFIG_DIR = __dirname + '/../config';

var which = require('which');
var Config = require('./Config.js');
var First = require('./First.js');

// Make sure the user does not run with sudo since we spawn shell commands.
var checkSudo = function() {
    var uid = parseInt(process.env.SUDO_UID);
    if (uid) {
        throw 'You are not allowed to run with sudo!\nThis is done for security reasons!!';
    }
};

// Check if the editor package will even work
var checkEditor = function() {
    if (!process.env.EDITOR) {
        try {
            which.sync('vim');
        } catch (e) {
            throw 'Your $EDITOR is not set and you don\'t have vim installed.\n' +
                'Please either set your env $EDITOR or install vim.';
        }
    }
};

/**
* Start the app.
*/
var start = function() {
    checkSudo();
    checkEditor();

    if(Config.exists()){
        require('./PluginLoader.js').run();
    } else {
        First.run(start);
    }
};

module.exports = start;