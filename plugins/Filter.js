var _ = require('lodash');
var Q = require('q');
var debug = require('debug')('plugin:Filter');
var debugErr = require('debug')('plugin:Filter:error');
var Util = require('../Util.js');

/**
* The filter plugin.
* @param {Object} The Jira Api as defined by the library jira.
*/
module.exports = function(jiraApi) {
    var self = {
        name: 'Filter',
        pattern: 'filter'
    };
    
    /**
    * The main point.
    * @param {Object} arguments The arguments object as initialized by the library minimist
    * @return {Object} Q.promise
    */
    self.hook = function(arguments) {
        if (arguments._[1] === 'all') {
            return self.getFilters();
        } else {
            return self.getIssues(arguments._[1]);
        }
    }

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
            }
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
                    debugErr('Could not find any filter with id: ' + filterId + '.');
                    throw '';
                } else {
                    return Q.ninvoke(jiraApi, 'requestRef', issue.searchUrl);
                };
            })
            .then(function(issues) {
                Util.createAsciiTable(makeTable(issues));
                deferred.resolve();
            }, deferred.reject)
            .done();

        return deferred.promise;
    }

    /**
    * Get all the filter ids.
    * @return {Object} Q.promise.
    */
    self.getFilters = function() {
        var deferred = Q.defer();

        var table = {
            head: ['id', 'name'],
            rows: []
        }

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
                debugErr("Failed to request to get all the favourites.");
                deferred.reject();
            })
            .done();

        return deferred.promise;
    }

    return self;
};