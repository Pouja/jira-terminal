var Util = require('./Util.js')();
var Jira = require('jira').JiraApi;
var _ = require('lodash');
var debug = require('debug')('PluginLoader');
var fs = require('fs');
var path = require('path');
var Config = require('./Config.js');

/**
 * @param {Array} plugins The name of the plugins to be loaded.
 * @param {Object} jira An Jira API instance.
 * @return {Array} A list of plugin objects.
 */
var loadPlugins = function(plugins, jira) {
    return _.map(plugins, function(plugin) {
        var Constr = require('./plugins/' + plugin + '.js');
        debug('Loaded plugin: %s.', plugin);
        return new Constr(jira);
    });
};

/**
 * Prints out the usages.
 * @param {Array} plugins A list of plugin objects.
 */
var printHelp = function(plugins) {
    Util.log('\nThe list of all plugins that can be invoked:\n');
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
};

/**
 * Invoke the correct plugin
 * @param {Array} plugins The plugins.
 * @param {String} name The name of the plugin.
 */
var invokePlugin = function(plugins, name) {
    var plugin = _.find(plugins, {
        pattern: name
    });

    if (plugin) {
        debug('Invoking hook of the plugin %s.', plugin.name);
        plugin.hook();
    } else {
        Util.error('Did not find a plugin that matches: %s.', name);
    }
};

/**
 * Retrieves all the plugin names in the directory /src/plugins/
 * @return {Array} name of all the plugins.
 */
var getPluginNames = function() {
    var files = fs.readdirSync('./src/plugins');

    return _(files)
        .filter(function(file) {
            return path.extname(file) === '.js';
        })
        .map(function(file) {
            return path.basename(file, '.js');
        })
        .value();
};

/**
 * Loads all the plugins and calls the corresponding plugin based on the first argument.
 */
module.exports.run = function() {
    var config = Config.load();
    var jira = new Jira(config.protocol, config.host, config.port, config.username,
        Util.getPassword(), config.apiVersion || 2);

    var plugins = loadPlugins(getPluginNames(), jira);
    var arg = process.argv[2];

    if (!arg || arg === 'help') {
        printHelp(plugins);
    } else {
        invokePlugin(plugins, arg);
    }
};
