var Q = require('q');
var Util = require('../Util.js');
var _ = require('lodash');
var moment = require('moment');

module.exports = function(jiraApi, argv){
    // This is done in such a way, so that we can test this.
    argv = argv || require('minimist')(process.argv.slice(2));

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
    * Adds a comment to an issue.
    * @return {Q}
    */
    self.add = function() {
        // var id = argv.i || argv._[1];
        var deferred = Q.defer();
        return deferred.promise;
    };

    /**
    * Prints the usages of this plugin.
    * @return {Q}
    */
    self.printHelp = function(){
        var deferred = Q.defer();
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
                if(!issue) {
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
