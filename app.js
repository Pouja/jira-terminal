var Jira = require('jira').JiraApi;
var Table = require('cli-table');
var _ = require('lodash');
var debug = require('debug')('jira-terminal');
var debugErr = require('debug')('jira-terminal:error');
var q = require('q');
var fs = require('fs');

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

// get parameters
// on: filter ID
jira.getFavourites(function(err, result){
    if(err) {
        debugErr(err);
    }
    jira.requestRef(result[0].searchUrl, function(err, result){
        makeTable(result);      
    });
});

function makeTable(result){
    var table = new Table({
        head: ['id', 'summary', 'issuetype', 'status', 'link'],
    });
    _.each(result.issues, function(issue){
        table.push([
            issue.id,
            issue.fields.summary,
            issue.fields.issuetype.name,
            issue.fields.status.name,
            issue.self         
        ]);
    });
    console.log(table.toString());    
}