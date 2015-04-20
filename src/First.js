var prompt = require('cli-prompt');
var _ = require('lodash');
var fs = require('fs');
var keytar = require('keytar');
var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var location = home + '/' + require('config').location;

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
    }], function(answers) {
        keytar.addPassword('jira-terminal', answers.username, answers.password);

        delete answers.password;

        _.assign(config, answers);

        console.log('Writing the configuration file to ' + location);
        fs.writeFileSync(location, JSON.stringify(answers), 'utf8');

        console.log('Starting the app.');
        cb();
    });
};
