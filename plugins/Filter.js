var _ = require('lodash');
var Table = require('cli-table');

module.exports = function(jiraApi){
    var self = {};
    self.pattern = /^(filter)/;
    
    /**
    * main start point 
    */
    self.hook = function(arguments) {
        var filterId = arguments._[1] + '';

        jiraApi.getFavourites(function(err, result){
            var issue = _.find(result, {id: filterId});
            if(!issue) {
                console.error('Could not find any filter with id: ' + filterId + '.');
            } else {
                jiraApi.requestRef(issue.searchUrl, function(err, result){
                    self.makeTable(result);
                });
            }
        });
    }

    self.makeTable = function(result){
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
    
    return self;
};