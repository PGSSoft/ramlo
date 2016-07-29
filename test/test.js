var ramloApi = require('../src/modules/api.js');
var assert = require('chai').assert;
var expect = require('chai').expect;
var fs = require('fs');

var _ = require('lodash');

var test = 'test/spec/api.raml';

var referenceRamlo = require('./referenceOutput');

//make sure the path of the file is correct before running the test
//module.exports = function () {
if (fs.existsSync(test)) {
    describe('API basic information', function () {

        var rm = ramloApi(test);

        it('Ramlo should return an object', function () {
            expect(typeof rm).to.equal('object');
        });

        _.forOwn(referenceRamlo, function (val, key) {
            // Each property has its own test suite
            it('Should have valid property ' + key, function () {

                //#1 - does the property exist
                expect(rm).to.have.ownProperty(key);
                var prop = rm[key];
                var type = _.isArray(val) ? 'array' : typeof val;

                //#2 - is the property of proper type
                expect(prop).to.be.a(type);

                //#3 - is the property value equal to reference (skipped if reference is empty)
                if (!(_.isNil(val) || _.isEmpty(val)))
                    expect(prop).to.equal(val);
            });
        });

        //describe('check prop values', function () {
        //    it('apiDescription should be formatted in markdown', function () {
        //        expect(rm.apiDescription).to.contain('<p>').and.contain('</p>');
        //    });
        //});

    });

}
else {
    console.log("the file doesn't exist");
}
//};
