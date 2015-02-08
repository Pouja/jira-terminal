var _ = require('lodash');
var Q = require('q');
var Util = require('../Util.js');
var NodeUtil = require('util');

/**
* The filter plugin.
* @param {Object} The Jira Api as defined by the library jira.
*/
module.exports = function(jiraApi, argv) {
    // This is done in such a way, so that we can test this.
    argv = argv || require('minimist')(process.argv.slice(2));

    var self = {
        name: 'Filter',
        pattern: 'filter'
    };

    /**
    * The main point.
    * @return {Object} Q.promise
    */
    self.hook = function() {
        if (argv._[1] === 'all') {
            return self.getFilters();
        } else {
            return self.getIssues(argv._[1]);
        }
    };

    /**
    * Retrievess all the issue that match the filter id.
    * @param {Number} filterId The filter id.
    * @return {Object} Q.promise.
    */
    self.getIssues = function(filterId) {
        var deferred = Q.defer();
        filterId = filterId + '';

        function makeTable(result) {
            var table = {
                head: ['id', 'summary', 'issuetype', 'status', 'link'],
                rows: []
            };

            _.each(result.issues, function(issue) {
                table.rows.push([
                    issue.id,
                    issue.fields.summary,
                    issue.fields.issuetype.name,
                    issue.fields.status.name,
                    issue.self
                ]);
            });
            return table;
        }

        Q.ninvoke(jiraApi, 'getFavourites')
            .then(function(favourites) {
                var issue = _.find(favourites, {
                    id: filterId
                });
                if (!issue) {
                    throw NodeUtil.format('Could not find any filter with id: %s.', filterId);
                } else {
                    return Q.ninvoke(jiraApi, 'requestRef', issue.searchUrl);
                }
            })
            .then(function(issues) {
                Util.createAsciiTable(makeTable(issues));
                deferred.resolve();
            }, function(err){
                if(typeof err === 'string'){
                    console.error(err);
                } else {
                    console.error(NodeUtil.format('Failed to retrieves the favourites. Error: %j', err));
                }
                deferred.reject(err);
            })
            .done();

        return deferred.promise;
    };

    /**
    * Get all the filter ids.
    * @return {Object} Q.promise.
    */
    self.getFilters = function() {
        var deferred = Q.defer();

        var table = {
            head: ['id', 'name'],
            rows: []
        };

        var filters = [];

        Q.ninvoke(jiraApi, 'getFavourites')
            .then(function(results) {
                filters = results.map(function(filter) {
                    return {
                        id: filter.id,
                        name: filter.name
                    };
                });
                _.each(filters, function(filter) {
                    table.rows.push([filter.id, filter.name]);
                });
                Util.createAsciiTable(table);
                deferred.resolve();
            }, function(err) {
                console.error(NodeUtil.format('Failed to request to get all the favourites. Error that was returned is %j', err));
                deferred.reject();
            })
            .done();

        return deferred.promise;
    };

    return self;
};
