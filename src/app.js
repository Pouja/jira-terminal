var Jira = require('jira').JiraApi;
var _ = require('lodash');
var debug = require('debug')('jira-terminal');
var argv = require('minimist')(process.argv.slice(2));
var Util = require('./Util.js');
var NodeUtil = require('util');
var config = require('../config.json');
var jira = new Jira(config.protocol, config.host, config.port, config.username,
    config.password, config.apiVersion || 2);

if (!config) {
    Util.error('You must create the config file \'config.json\'. See example.config.json');
    process.exit(1);
}

// Load all plugins.
var plugins = _.map(config.plugins, function(plugin) {
    var Constr = require('./plugins/' + plugin + '.js');
    debug(NodeUtil.format('Loaded plugin: %s', plugin));
    return new Constr(jira);
});

if (argv._[0] === 'help') {
    Util.log('\nThe list of all plugins that can be invoked.\n');
    var helps = plugins.map(function(plugin) {
        return [plugin.pattern, plugin.help];
    });
    Util.help(helps);
    Util.log('\nSome plugins print out a table which can be sorted and filtered by:\n');
    Util.help([
        ['-t NAME', 'sort by column NAME'],
        ['-f COLUMN:NEEDLE', 'filter on all occurences of NEEDLE in COLUMN'],
        ['-f NEEDLE', 'filter on all occurences of NEEDLE in a column']
    ]);
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
