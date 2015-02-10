var _ = require('lodash');
var CliTable = require('cli-table');
var argv = require('minimist')(process.argv.slice(2));
var config = require('../config.json');
var NodeUtil = require('util');

var Util = function() {
    var self = {};

    /**
     * @param {Object} obj The object.
     * @param {String} path The path to the nested value.
     * @return {Object|Array|Number|String} the value at the @code{path}.
     */
    var objectByPath = function(obj, path) {
        if (obj[path]) {
            return obj[path];
        }
        var current = obj;
        path.split('.').every(function(p) {
            current = current[p];
            return current !== undefined && current !== null;
        });
        return current;
    };

    /**
    * Easy util function to create a vertical rows for CliTable.
    * @param {Array} map A list of entries that should be converted to rows.
    * @param {String} map.name The name the row should have.
    * @param {String} map.key The identifier to where the value is stored.
    * @param {Boolean} map.issueLink Iff it is true: creates for that row an issue link. It uses the @code{data} object to retrieve the issue key.
    * @param {Boolean} map.linebreaks Iff it is true: cleanes the value and adds line breaks.
    * @param {Number} map.emptySpace Used in combation with linebreaks.
    * @param {Object} data The data.
    * @return {Array} an array of rows for vertical display.
    */
    self.makeVerticalRows = function(map, data) {
        return _.map(map, function(entry) {
            var row = {};
            if (entry.issueLink) {
                row[entry.name] = self.makeIssueLink(data);
                return row;
            } else {
                var body = objectByPath(data, entry.key);
                if (entry.linebreaks) {
                    body = self.setLinebreaks(self.cleanSentence(body), entry.emptySpace);
                }
                if (body) {
                    row[entry.name] = body;
                    return row;
                }
            }
        }).filter(function(e){
            return e;
        });
    };

    /**
    * @param {Object|String} issue This should either be the object which contains the key or the it should be issue key.
    * @return {String} A http link to the issue.
    * @throw Throws when @code{issue} is not a string or object.
    */
    self.makeIssueLink = function(issue) {
        if (typeof issue === 'string') {
            return NodeUtil.format('%s://%s/browse/%s', config.protocol, config.host, issue);
        } else if (typeof issue === 'object') {
            return NodeUtil.format('%s://%s/browse/%s', config.protocol, config.host, issue.key);
        } else {
            throw new Error('Util:makeIssueLink expects as argument either a string or object.');
        }
    };

    /**
     * Sorts the table rows on the given col name.
     * @param {Array} table.head The header names of the table.
     * @param {Array} table.rows The rows.
     * @param {String} columnName The column name (duh!).
     */
    self._sort = function(table, columnName) {
        var colNumber = _.findIndex(table.head, function(h) {
            return h.toLowerCase() === columnName.toLowerCase();
        });
        if (colNumber !== -1) {
            table.rows = _.sortBy(table.rows, function(row) {
                return row[colNumber];
            });
        }
    };

    /**
     * Filters the row(s) on the given string.
     * @param {Array} table.head The header names of the table.
     * @param {Array} table.rows The rows.
     * @param {String} filter The filter in the form of 'column:needle' or just 'needle'.
     */
    self._filter = function(table, filter) {
        if (~filter.indexOf(':')) {
            var columnName = filter.split(':')[0];
            var needle = filter.split(':')[1].toLowerCase();
            var colNumber = _.findIndex(table.head, function(h) {
                return h.toLowerCase() === columnName.toLowerCase();
            });
            if (colNumber !== -1) {
                table.rows = _.filter(table.rows, function(row) {
                    return~ row[colNumber].toLowerCase().indexOf(needle);
                });
            }
        } else {
            table.rows = _.filter(table.rows, function(row) {
                return _.filter(row, function(entry) {
                    return~ entry.toLowerCase().indexOf(filter.toLowerCase());
                });
            });
        }
    };

    /**
     * Removes line breaks and escapes.
     * Currenlty this fucks up the table layout.
     * TODO make sure that line breaks dont fuck up the layout.
     * @param {String} The sentece to be filtered.
     * @return {String} the sentences but cleaned.
     */
    self.cleanSentence = function(sentence) {
        return sentence.replace(/\'|\r|\t/g, '');
    };

    /**
     * Formats the sentences by appling line breaks so that the asciitable does not break.
     * @param {String} sentence The sentece to be formatted.
     * @param {Number} emptySpace The amount of space that is already take by the other columns.
     * return {String} the sentece with line breaks.
     */
    self.setLinebreaks = function(rawSentence, emptySpace) {
        var width = process.stdout.columns - emptySpace;
        var words = rawSentence.split(' ');

        // Will contain all the sentences with additional line breaks
        var sentences = '';

        // Length is the number of characters since the last line break
        var length = 0;

        words.forEach(function(word) {
            // If the sentence is getting to long, add a line break
            if (length + word.length >= width) {
                sentences += '\n' + word;
                length = word.length - word.lastIndexOf('\n');
                // If the next word already has a line break reset 'length'
            } else if (word.indexOf('\n') !== -1) {
                sentences += ' ' + word;
                length = word.length - word.lastIndexOf('\n');
            } else {
                sentences += word + ' ';
                length += word.length;
            }
        });
        return sentences;
    };

    /**
     * Creates an Ascii Table based on the library Cli-Table (yes i know the names are conflicting).
     * @param {Array} table.rows The rows to be added to the table.
     * @param {Array} table.head (Optional) The headers of each column.
     * @param {Boolean} table.sort (Optional) Default true. Indicate if it should sort if the argument is given.
     * @param {Boolean} table.filter (Optional) Default true. Indicate if it should filter if the argument is given.
     */
    self.createAsciiTable = function(table) {
        if (table.head || table.rows) {
            if (!table.sort && argv.t !== undefined) {
                self._sort(table, argv.t);
            }
            if (!table.filter && argv.f) {
                self._filter(table, argv.f);
            }
            var asciiTable = (table.head) ? new CliTable({
                head: table.head
            }) : new CliTable();

            _.each(table.rows, function(row) {
                asciiTable.push(row);
            });

            self.log(asciiTable.toString());
        }
    };

    /**
     * The logger of the application.
     * Uses the standard console.log iff the NODE_ENV is not 'test'.
     */
    self.log = (process.env.NODE_ENV !== 'test') ? console.log : function() {};

    /**
     * The error logger of the application.
     * Uses the standard console.error iff the NODE_ENV is not 'test'.
     */
    self.error = (process.env.NODE_ENV !== 'test') ? console.error : function() {};

    /**
     * Pretty prints the which arguments can be run with the given description.
     * The first row should contain the argument(s) and the second row should contain the description.
     */
    self.help = function(rows) {
        var table = new CliTable({
            chars: {
                'top': '',
                'top-mid': '',
                'top-left': '',
                'top-right': '',
                'bottom': '',
                'bottom-mid': '',
                'bottom-left': '',
                'bottom-right': '',
                'left': '  ',
                'left-mid': '',
                'mid': '',
                'mid-mid': '',
                'right': '',
                'right-mid': '',
                'middle': '  '
            },
            style: {
                'padding-left': 0,
                'padding-right': 0
            }
        });
        _.each(rows, function(row) {
            table.push(row);
        });
        console.log(table.toString());
    };

    return self;
};

// We want a singleton
module.exports = new Util();
