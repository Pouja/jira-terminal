var fs = require('fs');

/**
 * @return {Object} the config file.
 */
var load = function() {
    var configLocation;
    if (process.env.NODE_ENV === 'test') {
        configLocation = './test/TestConfig.json';
    } else {
        configLocation = fs.readFileSync('./config', 'utf8');
    }
    return JSON.parse(fs.readFileSync(configLocation, 'utf8'));
};

/**
* @return {Boolean} true iff the config file exists.
*/
var existsConfig = function() {
    try {
        fs.readFileSync('./config', 'utf8');
    } catch (e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
        return false;
    }
    return true;
};

/**
* @return {Boolean} true iff the config file is readable.
*/
var isReadAble = function() {
    try {
        var configLocation = fs.readFileSync('./config', 'utf8');
        JSON.parse(fs.readFileSync(configLocation, 'utf8'));
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
        return false;
    }
    return true;
};

/**
* @return {Boolean} true iff the config file exists and is readable.
*/
var exists = function() {
    return existsConfig() && isReadAble();
};

module.exports.exists = exists;
module.exports.load = load;
