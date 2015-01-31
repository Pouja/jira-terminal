var _ = require('lodash');
var Table = require('cli-table');

module.exports = function(jiraApi) {
    var self = {};
    self.pattern = 'filter';

    self.hook = function(arguments) {
        if (arguments._[1] === 'getAll') {
            self.getFilters();
        } else {
            self.getIssues(arguments._[1]);
        }
    }

    /**
     * main start point
     */
    self.getIssues = function(filterId) {
        filterId = filterId + '';

        function makeTable(result) {
            var table = new Table({
                head: ['id', 'summary', 'issuetype', 'status', 'link'],
            });
            _.each(result.issues, function(issue) {
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

        jiraApi.getFavourites(function(err, result) {
            var issue = _.find(result, {
                id: filterId
            });
            if (!issue) {
                console.error('Could not find any filter with id: ' + filterId + '.');
            } else {
                jiraApi.requestRef(issue.searchUrl, function(err, result) {
                    makeTable(result);
                });
            }
        });
    }

    self.getFilters = function() {
        function makeTable(filters) {
            var table = new Table({
                head: ['id', 'name'],
            });
            _.each(filters, function(filter) {
                table.push([filter.id, filter.name]);
            });
            console.log(table.toString());
        }

        var filters = [];
        jiraApi.getFavourites(function(err, results) {
            filters = results.map(function(filter) {
                return {
                    id: filter.id,
                    name: filter.name
                };
            });
            makeTable(filters);
        });
    }

    return self;
};