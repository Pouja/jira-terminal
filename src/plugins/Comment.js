var Q = require('q');
var Util = require('../Util.js')();
var _ = require('lodash');
var moment = require('moment');
var fs = require('fs');

module.exports = function(jiraApi, argv) {
    // This is done in such a way, so that we can test this.
    argv = argv || require('minimist')(process.argv.slice(2));

    // Used for adding a comment
    var emptySpace = 50;

    // The maximum number of comments to be shown in the editor when adding a new comment.
    var maxComments = 3;

    var self = {
        name: 'Comment',
        pattern: 'comment',
        help: 'show and add comments'
    };

    /**
     * The main point.
     * @return {Object} Q.promise
     */
    self.hook = function() {
        switch (argv._[1]) {
            case 'add':
                return self.add();
            case 'help':
                return self.printHelp();
            default:
                return self.show();
        }
    };

    /**
     * Converts a raw comment to a readable (for terminal) string
     * @param {Object} comment The comment as returned by the api.
     * @return {String} a pretty string with hashes.
     */
    var makePrettyComment = function(comment) {
        var newLine = '\n# ';
        var body = Util.setLinebreaks(comment.body, emptySpace)
            .replace(/\n/g, newLine);
        return [
            '# ' + comment.author.displayName,
            '\t',
            moment(comment.updated).format('YYYY-MM-DD HH:mm:ss'),
            newLine,
            body,
            newLine,
            '\n'
        ].join('');
    };

    /**
     * Converts the raw comments in the issue to a pretty format for in the terminal
     * @param {Object} issue The issue object as returned by the api.
     * @return {String} A pretty format to be shown in a file or terminal.
     */
    var makePrettyComments = function(issue) {
        var summary = issue.id + ' (' + issue.key + ')\t' + issue.fields.summary;
        summary = Util.setLinebreaks(summary, emptySpace)
            .replace(/\n/g, '\n# ');
        var pretty = [
            '\n#\n# Type the comment you want to add to issue: \n',
            '# ' + summary + '\n',
            '#\n# All lines starting with # will be ignore.\n',
            '#\n# The last ' + maxComments + ' comments are:\n',
        ];
        if (issue.fields.comment && issue.fields.comment.comments.length !== 0) {
            pretty = pretty.concat(_.map(issue.fields.comment.comments, makePrettyComment));
        }
        return _.flatten(pretty).join('');
    };

    /**
     * Generates a file containing the last n comments of the issue.
     * @param {String|Number} id The indentifier of the issue.
     * @return {Q}
     */
    var generateBufferedMessage = function(id) {
        var deferred = Q.defer();
        Q.ninvoke(jiraApi, 'findIssue', id)
            .then(function(issue) {
                if (!issue) {
                    deferred.reject('No issue found with id %s.', id);
                }
                deferred.resolve(makePrettyComments(issue));
            }, deferred.reject)
            .done();
        return deferred.promise;
    };

    /**
     * Adds a comment to an issue.
     * @return {Q}
     */
    self.add = function() {
        var filePath = __dirname + '/.BUFFERED_MESSAGE';
        var id = argv.i || argv._[2];
        var deferred = Q.defer();

        if (!id) {
            deferred.reject();
            throw 'Incorrect usages of \'comment add\', see \'comment help\' for more information.';
        }

        // Write file with generated comments
        generateBufferedMessage(id)
            .then(function(bufferedMessage) {
                fs.writeFileSync(filePath, bufferedMessage, 'utf8');

                // Let the user write his comment
                return Util.openEditor(filePath);
            })
            .then(function() {
                // Retrieve the comment
                var message = fs.readFileSync(filePath, 'utf8').replace(/\n#.*/g, '');

                if (message.trim() === '') {
                    Util.log('The body was empty, the submit was aborted.');
                    return null;
                } else {
                    // Save the comment
                    return Q.ninvoke(jiraApi, 'addComment', id, message);
                }
            })
            .then(function(response) {
                    if (response) {
                        Util.log('Added the comment to issue %s', id);
                    }
                    deferred.resolve();

                },
                function(err) {
                    Util.error('Error adding a comment for issue %s.\nError says %j', id, err);
                    deferred.reject();
                }).done();

        return deferred.promise;
    };

    /**
     * Prints the usages of this plugin.
     * @return {Q}
     */
    self.printHelp = function() {
        Util.help([
            ['Usages: comment', '[add -i ID] [add ID] [ID] [help]']
        ]);
        Util.log();
        var helps = [
            ['add', 'Adds a new comment. Opens your editor for adding a new comment.'],
            ['ID', 'Retrieves all the comments for that ID.'],
            ['help', 'Prints these message.']
        ];
        Util.help(helps);

        // We have to stay consistent. So just return an empty promise.
        var deferred = Q.defer();
        deferred.resolve();
        return deferred.promise;
    };

    /**
     * Prints all the comments for an issue in the CliTable.
     * @return {Q}
     */
    self.show = function() {
        var id = argv.i || argv._[1];
        var deferred = Q.defer();

        function makeTable(issue) {
            var table = {
                head: ['user', 'date', 'comment'],
                rows: []
            };
            if (issue.fields.comment) {
                _.each(issue.fields.comment.comments, function(comment) {
                    table.rows.push([
                        comment.author.displayName,
                        moment(comment.updated).format('YYYY-MM-DD HH:mm:ss'),
                        Util.setLinebreaks(Util.cleanSentence(comment.body), 80),
                    ]);
                });
            }
            return table;
        }

        Q.ninvoke(jiraApi, 'findIssue', id)
            .then(function(issue) {
                if (!issue) {
                    Util.error('No issue found with id %s.', id);
                }
                Util.createAsciiTable(makeTable(issue));
                deferred.resolve();
            }, function(err) {
                Util.error('Error showing all the comments for issue %s.\n Error says %j', id, err);
                deferred.reject();
            })
            .done();
        return deferred.promise;
    };

    return self;
};
