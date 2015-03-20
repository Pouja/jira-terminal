var fs = require('fs');
var which = require('which');

// Make sure the user does not run with sudo since we spawn shell commands.
var uid = parseInt(process.env.SUDO_UID);
if (uid) {
    throw 'You are not allowed to run with sudo!\nThis is done for security reasons!!';
}

// Check if the editor package will even work
if (!process.env.EDITOR) {
    try {
        which.sync('vim');
    } catch (e) {
        throw 'Your $EDITOR is not set and you don\'t have vim installed.\n' +
            'Please either set your env $EDITOR or install vim.';
    }
}

// Check for the existence of the config file.
try {
    var config = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf8'));
} catch (error) {
    if (error.code !== 'ENOENT') {
        throw error;
    }
    throw 'You must create the config file \'config.json\'.\nSee example.config.json';
}

require('./PluginLoader.js').run(config);
