var fs = require('fs');
var which = require('which');

/**
* Start the app.
*/
var start = function(configLocation) {
    try {
        var config = JSON.parse(fs.readFileSync(configLocation, 'utf8'));
        require('./PluginLoader.js').run(config);

    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
        console.error('It seems that you removed the configuration file.\nPlease restart the application');
        fs.unlinkSync('./config');
    }
}

// Make sure the user does not run with sudo since we spawn shell commands.
var checkSudo = function() {
    var uid = parseInt(process.env.SUDO_UID);
    if (uid) {
        throw 'You are not allowed to run with sudo!\nThis is done for security reasons!!';
    }
}

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
}

/**
* Get the path to the configuration file.
*/
var getConfigFile = function() {
    try {
        return fs.readFileSync('./config', 'utf8');
    } catch (e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
        require('./First.js')
            .run(start);
    }
    return null;
}

checkSudo();
checkEditor();

var config = getConfigFile();

if (config !== null) {
    start(config);
}
