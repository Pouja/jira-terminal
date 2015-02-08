var Jira = require('jira').JiraApi;
var _ = require('lodash');
var debug = require('debug')('jira-terminal');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var Util = require('./Util.js');
var NodeUtil = require('util');
var config = require('../config.json');

var jira = new Jira(config.protocol, config.host, config.port, config.username,
    config.password, config.apiVersion || 2);

// Load all plugins.
var plugins = _.map(config.plugins, function(plugin) {
    var Constr = require('./plugins/' + plugin + '.js');
    debug(NodeUtil.format('Loaded plugin: %s', plugin));
    return new Constr(jira);
});

if (argv._[0] === 'help') {
    var helps = plugins.map(function(plugin) {
        return [plugin.pattern, plugin.help];
    });
    Util.help(helps);
} else {
    // Get the plugin based on the first argument
    var plugin = _.find(plugins, {
        pattern: argv._[0]
    });

    if (plugin) {
        debug(NodeUtil.format('Invoking hook of the plugin %s.', plugin.name));
        plugin.hook(argv);
    } else {
        console.error(NodeUtil.format('Did not find a plugin that matches: %s.', argv._[0]));
    }
}
