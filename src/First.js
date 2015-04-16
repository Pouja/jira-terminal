var prompt = require('cli-prompt');
var _ = require('lodash');
var fs = require('fs');
var keytar = require('keytar');

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
        'git': {
            'default': 'master',
            'branchMaxLength': 50,
            'nameMapping': {
                '_': 'bugfix',
                'Story': 'feature',
                'New Feature': 'feature'
            }
        }
    };

    console.log('You will be prompt to fill in some information.');
    console.log('These information are necessary to run the application.');
    console.log('For the password, your key chain ring will be used to store and retrieve the password.');

    prompt.multi([{
        key: 'host',
        label: 'host (jira.example.com)'
    }, {
        key: 'username'
    }, {
        key: 'password',
        type: 'password'
    }, {
        key: 'path',
        label: 'path (the absolute path to store the config file)'
    }], function(answers) {
        var filename = 'jira-terminal-config.json';

        keytar.addPassword('jira-terminal', answers.username, answers.password);

        var path = answers.path;
        path += (path[path.length - 1] === '/') ? filename : '/' + filename;

        delete answers.path;
        delete answers.password;

        _.assign(config, answers);

        console.log('Writing the configuration file to ' + path);
        fs.writeFileSync(path, JSON.stringify(config), 'utf8');
        fs.writeFileSync('./config', path, 'utf8');

        console.log('Starting the app.');
        cb(path);
    });
};
