var Jira = require('jira').JiraApi;
var _ = require('lodash');
var debug = require('debug')('jira-terminal');
var debugErr = require('debug')('jira-terminal:error');
var q = require('q');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var CliTable = require('cli-table');

var config = {};

var loadConfig = function() {
    if (fs.existsSync(__dirname + '/config.json')) {
        var content = fs.readFileSync('config.json', 'utf8');
        config = JSON.parse(content);
    } else {
        console.error('You must create a config.json file. Example {');
        console.error('\t"protocol": "https"');
        console.error('\t"host": "jira.example.nl"');
        console.error('\t"port": 443');
        console.error('\t"username": "john.awesome"');
        console.error('\t"password": "mysecret"');
        console.error('}');
    }
}();

var jira = new Jira(config.protocol, config.host, config.port, config.username,
    config.password, config.apiVersion || 2);

// Load all plugins.
var plugins = _.map(config.plugins, function(plugin) {
    var constr = require('./plugins/' + plugin + '.js');
    debug('Loaded plugin: ' + plugin);
    return new constr(jira);
});

/**
 * Sorts the table rows on the given col name.
 * @param {Array} table.head The header names of the table.
 * @param {Array} table.rows The rows.
 * @param {String} columnName The column name (duh!).
 */
var sort = function(table, columnName) {
    var colNumber = _.findIndex(table.head, function(h) {
        return h.toLowerCase() === columnName.toLowerCase();
    });
    if (colNumber !== -1) {
        table.rows = _.sortBy(table.rows, function(row) {
            return row[colNumber];
        });
    }
}

/**
 * Filters the row(s) on the given string.
 * @param {Array} table.head The header names of the table.
 * @param {Array} table.rows The rows.
 * @param {String} filter The filter in the form of 'column:needle' or just 'needle'.
 */
var filter = function(table, filter) {
    if (~filter.indexOf(':')) {
        var columnName = filter.split(':')[0];
        var needle = filter.split(':')[1].toLowerCase();
        var colNumber = _.findIndex(table.head, function(h) {
            return h.toLowerCase() === columnName.toLowerCase();
        });
        if (colNumber !== -1) {
            table.rows = _.filter(table.rows, function(row) {
                return ~row[colNumber].toLowerCase().indexOf(needle);
            });
        }
    } else {
        table.rows = _.filter(table.rows, function(row){
            return _.filter(row, function(entry){
                return ~entry.toLowerCase().indexOf(filter.toLowerCase());
            });
        });
    }
}

var plugin = _.find(plugins, {
    pattern: argv._[0]
});

if (plugin) {
    debug("Matched " + argv._[0] + " with plugin " + plugin.name + ".");
    plugin.hook(argv)
        .then(function(table) {
            if (table.head || table.rows) {
                if (!table.sort && argv.t !== undefined) {
                    sort(table, argv.t);
                }
                if (!table.filter && argv.f) {
                    filter(table, argv.f);
                }

                var asciiTable = (table.head) ? new CliTable({
                    head: table.head
                }) : new CliTable({colWidths:[10,150]});
                _.each(table.rows, function(row) {
                    asciiTable.push(row);
                });

                console.log(asciiTable.toString());
            }
        }, function(err) {
            console.error("Error occured when executing the hook for the plugin " + plugin.name + ".");

            if (err) {
                console.error("This was the error message returned: ");
                console.error(err);
            }
        })
        .done();
} else {
    console.error("Did not find a plugin that matches: " + argv._[0]);
}