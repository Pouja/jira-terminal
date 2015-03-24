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
        name: 'Transition',
        pattern: 'transition',
        help: 'Applies a transition to an issue'
    };

    /**
     * The main point.
     * @return {Object} Q.promise
     */
    self.hook = function() {
        if (argv._[1] === 'help') {
            return self.help();
        } else if (argv._.length === 2) {
            return self.transitions();
        } else if (argv._.length === 3) {
            return self.applyTransition();
        } else {
            return self.help();
        }
    }

    /**
     * Called with 'transition help'.
     * Prints the usages and the description of each command.
     * @return {Q}
     */
    self.help = function() {
        Util.help([
            ['Usages: transitions', '[help] [ID] [ID NUMBER] [ID NUMBER -a ASSIGN -s STATUS -m']
        ]);
        Util.log();
        var helps = [
            ['help', 'prints out this help'],
            ['ID', 'prints out all possible transitions for the issue'],
            ['ID NUMBER', 'applies transition id NUMBER to the issue, when using the m it will open up the editor']
        ];
        Util.help(helps);

        // We have to stay consistent. So just return an empty promise.
        var deferred = Q.defer();
        deferred.resolve();
        return deferred.promise;
    };

    /**
     * Prints out all the possible transitions for the given issue key/id.
     * @return {Q}
     */
    self.transitions = function() {
        var deferred = Q.defer();
        var issue = argv._[1];

        function makeTable(transitions) {
            var table = {
                head: ['id', 'name', 'to'],
                rows: []
            };
            table.rows = _.map(transitions, function(transition) {
                return [transition.id, transition.name, transition.to.name];
            });
            return table;
        };

        Q.ninvoke(jiraApi, 'listTransitions', issue)
            .then(function(transitions) {
                Util.createAsciiTable(makeTable(transitions.transitions));
                deferred.resolve();
            }, function(error) {
                Util.error('Failed to retrieves the transitions. Error: %j', error);
            }).done();
        return deferred.promise;
    };

    /**
     * Searches all the possible transition for 'issue' that has an id/name that matches 'name'.
     * @param {String|Number} issue The issue id/key.
     * @param {String|Number} name The name/id of the transition.
     * @return {Q}.
     */
    var fetchId = function(issue, name) {
        var deferred = Q.defer();
        Q.ninvoke(jiraApi, 'listTransitions', issue)
            .then(function(transitions) {
                var transition = _.find(transitions.transitions, function(transition) {
                    // The name can be a string of only numbers due minimist parses everything as strings..
                    return transition.id == name || transition.name === name;
                });
                if (!transition) {
                    throw 'No transitions found or is possible with id/name ' + name + ' for issue ' + issue + '.';
                }
                deferred.resolve(transition);
            }, deferred.reject)
            .done();
        return deferred.promise;
    };

    /**
    * Fetches the issue and makes a branch if 'branch' is set to true.
    * @param {String|Number} issueKey The issue id/key.
    * @param {Boolean} branch Set to true if it should branch.
    * return {Q}
    */
    var makeBranch = function(issueKey, branch) {
        var deferred = Q.defer();
        if (branch) {
            Q.ninvoke(jiraApi, 'findIssue', issueKey)
                .then(function(issue) {
                    if (issue) {
                        Util.branch(issue);
                    }
                    deferred.resolve();
                }, deferred.reject)
                .done();
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    };

    /**
     * Prints out all the possible transitions for the given issue key/id.
     * @return {Q}
     */
    self.applyTransition = function() {
        var deferred = Q.defer();
        var issueKey = argv._[1];
        var transId = argv._[2];

        fetchId(issueKey, transId)
            .then(function(transition) {
                return Q.ninvoke(jiraApi, 'transitionIssue', issueKey, {
                    transition: {
                        id: transition.id
                    }
                });
            })
            .then(function() {
                return makeBranch(issueKey, argv.branch);
            }).then(function() {
                Util.log('Succesfull update issue %s', issueKey);
                deferred.resolve();
            }, function(err) {
                Util.error('Error starting the issue %s. The error that was retrieved is %j', issueKey, err);
                deferred.reject();
            }).done();
        return deferred.promise;
    };

    return self;
};
