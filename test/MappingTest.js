var Mapping = require('../src/Mapping');

describe('Mapping', function(){
    describe('#mapping', function(){
        it('mapping should be non empty and should be an array', function(){
            Mapping.mapping.should.be.Array;
            Mapping.mapping.length.should.be.above(0);
        });
    });
    describe('#set', function(){
        it('Should throw when a key is undefined', function(){
            (function(){
                Mapping.set([{
                    key: 'awesome'
                }]);
            }).should.throw();
        });
        it('Should return a correct set', function(){
            var map = [{
                value: 3,
                key: 'assignee'
            }, {
                value: 'version1',
                key: 'fixVersions'
            }, {
                value: '14 hours',
                key: 'timetracking'
            }];
            var set = Mapping.set(map);
            set.should.have.keys('assignee','fixVersions','timetracking');
            set.assignee.should.have.property('id').with.equal(3);
            set.timetracking.should.have.keys('originalEstimate');
            set.fixVersions.should.be.Array;
            set.fixVersions[0].should.have.property('name').with.equal('version1');
        });
    });
});
