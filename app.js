var Jira = require('jira').JiraApi;
var _ = require('lodash');
var debug = require('debug')('jira-terminal');
var debugErr = require('debug')('jira-terminal:error');
var q = require('q');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var config = {};

var loadConfig = function() {
    if(fs.existsSync(__dirname + '/config.json')) {
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

_.each(plugins, function(plugin){
    if(plugin.pattern.test(argv._[0])) {
        plugin.hook(argv);
    }
});