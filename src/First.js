var prompt = require('cli-prompt');
var _ = require('lodash');
var fs = require('fs');

/**
* This will run on the first time.
* It will set the password and username etc.
*/
module.exports.run = function(cb) {
    var config = {
        'protocol': 'https',
        'host': 'jira.example.nl',
        'port': 443,
        'username': 'john.lee',
        'password': 'secret',
    };

    console.log('You will be prompt to fill in some information.');
    console.log('These information are necessary to run the application.');

    prompt.multi([{
        key: 'host',
        label: 'host (jira.example.com)'
    }, {
        key: 'username'
    }, {
        key: 'password',
        label: 'password (currently this will be save as plain text)',
        type: 'password'
    }, {
        key: 'path',
        label: 'path (the absolute path to store the config file)'
    }], function(answers) {
        var filename = 'jira-terminal-config.json';

        var path = answers.path;
        path += (path[path.length - 1] === '/') ? filename : '/' + filename ;
        delete answers.path;

        _.assign(config, answers);

        console.log('Writing the configuration file to ' + path);
        fs.writeFileSync(path, JSON.stringify(config), 'utf8');
        fs.writeFileSync('./config', path, 'utf8');

        console.log('Starting the app.');
        cb(path);
    });
}
