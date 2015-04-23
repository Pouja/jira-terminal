var _ = require('lodash');

/* Mapping of a value to a path.
 So for example if you ask the JIRA api to get the details of an issue you will get:

issue = {
    key: 'TEST-1',
    id: 1023,
    fields: {
        assignee: {
            id: 1,
            name: 'test.person'
        },
        timetracking: {
            originalEstimate: 30,
            newEstimate: 10
        },
        fixVersion: [{
            id: 1,
            name: version1
        }]
    }
}
This mapping tells for example that assignee is an object which can have an id and a name.
*/
var mapping = [{
    key: 'assignee',
    type: 'object'
}, {
    key: 'fixVersions',
    type: 'array'
}, {
    key: 'resolution',
    type: 'object'
}, {
    key: 'reporter',
    type: 'object'
}, {
    key: 'timetracking',
    type: 'special',
    path: 'originalEstimate'
}];

/**
* @param {Boolean|Number|String|Object|null|undefined} n The value to be checked.
* @return {Boolean} true iff the value is a number.
*/
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
* Creates a fields object which can be passed to a JIRA API request.
* @param {String} map[].value
* @param {String} map[].key
* @return {Object}
*/
var set = function(map) {
    var fields = {};
    _.each(map, function(value) {
        var field = _.find(mapping, {
            key: value.key
        });
        if (field) {
            var obj = {};
            if (isNumber(value.value)) {
                obj.id = value.value;
            } else {
                obj.name = value.value;
            }
            if (field.type === 'object') {
                fields[value.key] = obj;
            } else if (field.type === 'array') {
                fields[value.key] = [obj];
            } else if (field.type === 'special') {
                fields[value.key] = {};
                fields[value.key][field.path] = value.value;
            }
        } else {
            throw 'Unknown key ' + value.key + ' specified in Mapping.js:set.';
        }
    });
    return fields;
};

module.exports.set = set;
module.exports.mapping = mapping;
