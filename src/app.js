var Jira = require('jira').JiraApi;
var _ = require('lodash');
var debug = require('debug')('jira-terminal');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var Util = require('util');
var config = require('../config.json');

var jira = new Jira(config.protocol, config.host, config.port, config.username,
    config.password, config.apiVersion || 2);

// Load all plugins.
var plugins = _.map(config.plugins, function(plugin) {
    var Constr = require('./plugins/' + plugin + '.js');
    debug(Util.format('Loaded plugin: %s', plugin));
    return new Constr(jira);
});

// Get the plugin based on the first argument
var plugin = _.find(plugins, {
    pattern: argv._[0]
});

if (plugin) {
    debug(Util.format('Invoking hook of the plugin %s.', plugin.name));
    plugin.hook(argv);
} else {
    console.error(Util.format('Did not find a plugin that matches: %s.', argv._[0]));
}
