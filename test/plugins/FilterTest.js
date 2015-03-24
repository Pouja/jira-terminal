var Filter = require('../../src/plugins/Filter.js');
var filter;

describe('plugin:filter', function() {
    describe('#hook', function() {
        it('Should call getFilters when argument equals all', function(done) {
            filter = new Filter({}, {
                _: ['', 'all']
            });
            filter.getFilters = done;
            filter.getIssues = function() {
                done('This should not be called.');
            };
            filter.hook();
        });
        it('Should call getIssues when argument does not equal all', function(done) {
            filter = new Filter({}, {
                _: ['', '123']
            });
            filter.getFilters = function() {
                done('This should not be called.');
            };
            filter.getIssues = function() {
                done();
            };
            filter.hook();
        });
    });
    describe('#getIssues', function() {
        beforeEach(function() {
            filter = new Filter({
                getFavourites: function(callback) {
                    callback(null, [{
                        id: '123',
                        searchUrl: ''
                    }]);
                },
                requestRef: function(arg1, callback) {
                    callback(null, []);
                }
            });
        });
        it('Should fail since the id is unknown', function(done) {
            filter.getIssues(12).then(function() {
                done('This should fail not succeed.');
            }, function() {
                done();
            });
        });
        it('Should not fail', function(done) {
            filter.getIssues('123').then(done, done);
        });
    });
    describe('#getFilters', function() {
        beforeEach(function() {
            filter = new Filter({
                getFavourites: function(callback) {
                    callback(null, [{
                        id: '123',
                        name: 'test filter',
                        searchUrl: ''
                    }]);
                }
            });
        });
        it('Should resolve since callback does not return any error', function(done) {
            filter.getFilters().then(done, done);
        });
    });
});
