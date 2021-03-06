var _ = require('lodash');
var Q = require('q');
var Util = require('../Util.js')();
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
        pattern: 'filter',
        help: 'retrieve all your filters and print all issues that match that filter'
    };

    /**
     * The main point.
     * @return {Object} Q.promise
     */
    self.hook = function() {
        switch (argv._[1]) {
            case 'all':
                return self.getFilters();
            case 'help':
                return self.printHelp();
            default:
                return self.getIssues(argv._[1]);
        }
    };


    /**
     * Called with 'filter help'.
     * Prints the usages and the description of each command.
     * @return {Q}
     */
    self.printHelp = function() {
        Util.help([
            ['Usages: filter', '[all] [ID]']
        ]);
        Util.log();
        var helps = [
            ['all', 'retrieves all filter identifiers that are in your favourites'],
            ['ID', 'prints all the issues that match the filter id']
        ];
        Util.help(helps);

        // We have to stay consistent. So just return an empty promise.
        var deferred = Q.defer();
        deferred.resolve();
        return deferred.promise;
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
                head: ['key', 'summary', 'type', 'status', 'assignee', 'component'],
                rows: []
            };
            table.rows = _.map(result.issues, function(issue) {
                var components = _.map(issue.fields.components, 'name').join(',');
                var assignee = (issue.fields.assignee) ? issue.fields.assignee.name : 'None';
                return [
                    issue.key,
                    Util.setLinebreaks(issue.fields.summary, 90),
                    issue.fields.issuetype.name,
                    issue.fields.status.name,
                    assignee,
                    components
                ];
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
            }, function(err) {
                if (typeof err === 'string') {
                    Util.error(err);
                } else {
                    Util.error('Failed to retrieves the favourites. Error: %j', err);
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
                Util.error('Failed to request to get all the favourites. Error that was returned is %j', err);
                deferred.reject();
            })
            .done();

        return deferred.promise;
    };

    return self;
};
