var _ = require('lodash');
var CliTable = require('cli-table');
var argv = require('minimist')(process.argv.slice(2));

module.exports = function() {
    var self = {};
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
    }

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
    }

    /**
    * Removes line breaks and escapes.
    * Currenlty this fucks up the table layout.
    * TODO make sure that line breaks dont fuck up the layout.
    * @param {String} The sentece to be filtered.
    * @return {String} the sentences but cleaned.
    */
    self.cleanSentence = function(sentence) {
        return sentence.replace(/\'|\r|\n/g, '');
    }

    /** 
    * Formats the sentences by appling line breaks so that the asciitable does not break.
    * @param {String} sentence The sentece to be formatted.
    * @param {Number} emptySpace The amount of space that is already take by the other columns.
    * return {String} the sentece with line breaks.
    */
    self.setLinebreaks = function(rawSentence, emptySpace) {
        var width = process.stdout.columns - emptySpace;
        var words = rawSentence.split(' ');
        var sentences = [words[0]];
        var counter = 0;
        for(var i = 1; i < words.length; i++) {
            if(sentences[counter].length + words[i].length > width) {
                sentences[counter] += '\n' + words[i];
                counter++;
                sentences[counter] = '';
            } else {
                sentences[counter] += ' ' + words[i];
            }
        }
        return sentences.join();
    }

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

            console.log(asciiTable.toString());
        }
    }
    return self;
}();