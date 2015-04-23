var fs = require('fs');
var config = require('config');
var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

/**
 * @return {Object} the config file.
 */
var load = function() {
    if (process.env.NODE_ENV === 'test') {
        return config;
    }
    return JSON.parse(fs.readFileSync(home + '/' + config.location + config.config, 'utf8'));
};

/**
* @return {Boolean} true iff the config file is readable.
*/
var isReadAble = function() {
    try {
        JSON.parse(fs.readFileSync(home + '/' + config.location + config.config, 'utf8'));
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
        return false;
    }
    return true;
};

module.exports.exists = isReadAble;
module.exports.load = load;
module.exports.bufferedPath = home + '/' + config.location + config.buffer;
