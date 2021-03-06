var Q = require('q');
var debugErr = require('debug')('plugin:Issue:error');
var Util = require('../Util.js')();
var fs = require('fs');
var which = require('which');
var shell = require('shelljs');
var bufferedPath = require('../Config.js').bufferedPath;

module.exports = function(jiraApi, argv) {
    // This is done in such a way, so that we can test this.
    argv = argv || require('minimist')(process.argv.slice(2));

    var self = {
        name: 'Issue',
        pattern: 'issue',
        help: 'new, start, stop or retrieve information about a specific issue'
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
            debugErr('Unknown issue command %s.', call);
            deferred.reject();
        }

        return deferred.promise;
    };

    /**
     * Called with 'issue help'.
     * Prints the usages and the description of each command.
     * @return {Q}
     */
    self.helpHandler = function() {
        Util.help([
            ['Usages: issue',
                Util.setLinebreaks('[get ID] [link ID] [new -t TYPE -p PROJECT]', null, 80)
            ]
        ]);
        Util.log();
        var helps = [
            ['get', 'prints additional information about the given issue id, you can also create a branch and or checkout'],
            ['new', 'creates a new issue'],
            ['link', 'copies the link to the url for the issue to the clipboard']
        ];
        Util.help(helps);

        // We have to stay consistent. So just return an empty promise.
        var deferred = Q.defer();
        deferred.resolve();
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
            var rows = Util.makeVerticalRows([{
                name: 'id',
                key: 'id'
            }, {
                name: 'key',
                key: 'key'
            }, {
                name: 'summary',
                key: 'fields.summary',
                linebreaks: true,
                emptySpace: 50
            }, {
                name: 'issue type',
                key: 'fields.issuetype.name'
            }, {
                name: 'reporter',
                key: 'fields.reporter.name'
            }, {
                name: 'description',
                key: 'fields.description',
                linebreaks: true,
                emptySpace: 50
            }, {
                name: 'status',
                key: 'fields.status.name'
            }, {
                name: 'project',
                key: 'fields.project.name'
            }, {
                name: 'assignee',
                key: 'fields.assignee.name'
            }, {
                name: 'link',
                issueLink: true
            }], issue);
            return {
                rows: rows,
                filter: false,
                sort: false,
                head: false,
            };
        }

        Q.ninvoke(jiraApi, 'findIssue', id)
            .then(function(issue) {
                if (argv.print) {
                    console.log(issue);
                }
                Util.createAsciiTable(makeTable(issue));
                deferred.resolve();
            }, function(err) {
                Util.error('Error retrieving the information for issue %s.\n Error says %j', id, err);
                deferred.reject();
            })
            .done();
        return deferred.promise;
    };


    /**
    * Generates a message for when adding a new issue.
    * @param {Object} issue.fields Should have only the project.key and issuetype.name
    * @return A message.
    */
    var generateMessage = function(issue) {
        return ['\n# Write the summary and description for a new issue for ',
            issue.fields.project.key,
            ' with type ',
            issue.fields.issuetype.name,
            '\n# The first line will be the summary, all lines after that will be the summary.',
            '\n# All lines starting with # will be ignored.'
        ].join('');
    };

    /**
    * Copies the link to issue to the clipboard.
    * return {Q}
    */
    self.linkHandler = function() {
        var deferred = Q.defer();
        var id = argv._[2];

        try{
            which.sync('xclip');
        } catch(e) {
            throw 'You need xclip for this.';
        }

        shell.exec('echo "' + Util.makeIssueLink(id) + '" | xclip -sel clip');
        Util.log('Copied to clipboard.');

        deferred.resolve();
        return deferred.promise;
    };

    /**
    * Creates a new issue.
    * The only params required are -p the project key and -t the type of bug (case senstitive).
    * @return {Q}
    */
    self.newHandler = function() {
        var deferred = Q.defer();

        if (!argv.p || !argv.t) {
            Util.error('Incorrect usage of \'issue new\', see \'issue help\'for more information.');
            deferred.reject();
            return deferred.promise;
        }

        var issue = {
            fields: {
                project: {
                    key: argv.p
                },
                issuetype: {
                    name: argv.t
                }
            }
        };

        fs.writeFileSync(bufferedPath, generateMessage(issue), 'utf8');
        Util.openEditor(bufferedPath)
            .then(function() {
                var message = fs.readFileSync(bufferedPath, 'utf8').replace(/\n#.*/g, '');

                if (message.trim() === '') {
                    throw 'The body was empty, the submit was aborted.';
                }

                var messages = message.split('\n');
                issue.fields.summary = messages.shift();
                issue.fields.description = messages.join('\n').trim();

                return Q.ninvoke(jiraApi, 'addNewIssue', issue);
            })
            .then(function(issueKey) {
                Util.log('Succesfull created new issue under key %s.\nThe link is %s', issueKey.key,
                    Util.makeIssueLink(issueKey.key));
                deferred.resolve();
            }, function(error) {
                Util.error('Error creating a new issue. The error that was retrieved is %j', error);
                deferred.reject();
            });
        return deferred.promise;
    };
    return self;
};
