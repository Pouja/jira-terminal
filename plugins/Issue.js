var _ = require('lodash');
var Q = require('q');
var debug = require('debug')('plugin:Issue');
var debugErr = require('debug')('plugin:Issue:error');
var Util = require('../Util.js');

module.exports = function(jiraApi) {
    var self = {
        name: 'Issue',
        pattern: 'issue'
    };

    /**
     * Main point of the plugin.
     * @param {Object} arguments The object as returned by the library minimist/
     * @return {Q}
     */
    self.hook = function(arguments) {
        var call = arguments._[1];
        var deferred = Q.defer();

        if (self[call + 'Handler']) {
            return self[call + 'Handler'](arguments);
        } else {
            debugErr('Unknown issue command ' + call + '.');
            deferred.reject();
        }

        return deferred.promise;
    }

    /**
     * Callend for 'issue get ID'
     * @param {Object} arguments The object as returned by the library minimist/
     * @return {Q}
     */
    self.getHandler = function(arguments) {
        var id = arguments._[2];
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
                console.error(err);
                deferred.reject();
            })
            .done();
        return deferred.promise;
    }

    self.startHandler = function(arguments) {
        var id = arguments._[2];
        var deferred = Q.defer();
        Q.ninvoke(jiraApi, 'getCurrentUser')
            .then(function(currentUser) {
                return Q.ninvoke(jiraApi, 'transitionIssue', id, {
                    transition: {
                        id: 4
                    }                   
                });
            })
            .then(function() {
                console.log("Succesfull update issue " + id + ".");
                deferred.resolve();
            }, function(err) {
                console.error(err);
                deferred.reject();
            });
        return deferred;
    }

    return self;
}