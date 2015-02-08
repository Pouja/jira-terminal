var Q = require('q');
var debugErr = require('debug')('plugin:Issue:error');
var Util = require('../Util.js');
var NodeUtil = require('util');

module.exports = function(jiraApi, argv) {
    // This is done in such a way, so that we can test this.
    argv = argv || require('minimist')(process.argv.slice(2));

    var self = {
        name: 'Issue',
        pattern: 'issue'
    };

    /**
     * Main point of the plugin.
     * @return {Q}
     */
    self.hook = function() {
        var call = argv._[1];
        var deferred = Q.defer();

        if (self[call + 'Handler']) {
            return self[call + 'Handler']();
        } else {
            debugErr(NodeUtil.format('Unknown issue command %s.', call));
            deferred.reject();
        }

        return deferred.promise;
    };

    /**
     * Callend for 'issue get ID'
     * @return {Q}
     */
    self.getHandler = function() {
        var id = argv._[2];
        var deferred = Q.defer();

        function makeTable(issue) {
            return {
                rows: [{
                    'id': issue.id + ''
                }, {
                    'summary': issue.fields.summary
                }, {
                    'issueType': issue.fields.issuetype.name
                }, {
                    'reporter': issue.fields.reporter.name
                }, {
                    // Descriptions can be way too long and contain linebreaks, tabs etc, so break it and clean.
                    'description': Util.setLinebreaks(Util.cleanSentence(issue.fields.description), 40)
                }, {
                    'status': issue.fields.status.id
                }, {
                    'project': issue.fields.project.name
                }, {
                    'assignee': (issue.fields.assignee) ? issue.fields.assignee.name : ''
                }],
                filter: false,
                sort: false,
                head: false,
            };
        }

        Q.ninvoke(jiraApi, 'findIssue', id)
            .then(function(issue) {
                Util.createAsciiTable(makeTable(issue));
                deferred.resolve();
            }, function(err) {
                console.error(NodeUtil.format('Error retrieving the information for issue %s.\n Error says %j', id, err));
                deferred.reject();
            })
            .done();
        return deferred.promise;
    };

    /**
     * Starts an issue based on the transition.
     * @return {Q}
     */
    self.startHandler = function() {
        var id = argv._[2];
        var deferred = Q.defer();

        if (!id) {
            console.error('The ID must be supplied.');
            deferred.reject();
            return deferred;
        }

        Q.ninvoke(jiraApi, 'transitionIssue', id, {
            transition: {
                id: 4
            }
        })
            .then(function() {
                console.log(NodeUtil.format('Succesfull update issue %s', id));
                deferred.resolve();
            }, function(err) {
                console.error(NodeUtil.format('Error starting the issue %s. The error that was retrieved is %j', id, err));
                deferred.reject();
            });
        return deferred;
    };

    /**
     * Called by 'issue stop ID STATUS MSG'.
     * @return {Q}
     */
    self.stopHandler = function() {
        var deferred = Q.defer();

        var id = argv._[2];
        var status = argv._[3];
        var message = argv._[4];

        if (!status || !id || !message) {
            console.error('You must supply the id, status and message, in that order.');
            deferred.reject();
            return deferred;
        }

        Q.ninvoke(jiraApi, 'transitionIssue', id, {
            transition: {
                id: 5
            },
            resolution: {
                name: status
            },
            comment: [{
                add: {
                    body: message
                }
            }]
        })
            .then(function() {
                console.log(NodeUtil.format('Succesfull update issue %s.', id));
                deferred.resolve();
            }, function(err) {
                console.error(NodeUtil.format('Error stopping the issue %s. The error that was retrieved is %j', id, err));
                deferred.reject();
            });
        return deferred;
    };

    return self;
};