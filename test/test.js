var ramloApi = require('../src/modules/api.js');
var assert = require('chai').assert;
var expect = require('chai').expect;
var fs = require('fs');

var _ = require('lodash');

var test = 'test/spec/api.raml';

var referenceRamlo = require('./referenceOutput');

//make sure the path of the file is correct before running the test
if (fs.existsSync(test)) {

    describe('Ramlo', function () {

        var rm = ramloApi(test);

        describe('API basic information', function () {

            it('Ramlo should return an object', function () {
                expect(typeof rm).to.equal('object');
            });

            //Checking all of the basic properties
            _.forOwn(referenceRamlo.basicInfo, function (refVal, refKey) {
                // Each property has its own test suite
                it('Should have valid property ' + refKey, function () {

                    //#1 - does the property exist
                    expect(rm).to.have.ownProperty(refKey);
                    var prop = rm[refKey];
                    var type = _.isArray(refVal) ? 'array' : typeof refVal;

                    //#2 - is the property of proper type
                    expect(prop).to.be.a(type);

                    //#3 - is the property value equal to reference (skipped if reference is null/undefined/empty)
                    if (!(_.isNil(refVal) || _.isEmpty(refVal))) {
                        if (_.isArray(refVal)) {
                            expect(prop.length).to.equal(refVal.length);
                            //TODO tests to compare array contents
                        } else {
                            expect(prop).to.equal(refVal);
                        }
                    }

                });
            });

        });

        // Checking data types with example type 'Person' and extending types
        describe('API Data Types', function () {
            var testType = null;
            before(function () {
                testType = _.find(rm.apiAllTypes, 'Person');
            });
            describe('General', function () {
                it('Should contain data types array', function () {
                    expect(rm).to.have.ownProperty('apiAllTypes');
                    expect(rm.apiAllTypes).to.be.a('array');
                });

                it('Data types should contain Person type object', function () {
                    //testType = _.find(rm.apiAllTypes, 'Person');
                    expect(testType).to.be.a('object');
                    expect(testType.Person).to.be.a('object');
                });

            });
            describe('Object type', function () {
                var person;
                before(function () {
                    person = testType.Person;
                });
                describe('Type facets', function () {
                    it('Person type should have all standard facets', function () {
                        expect(person).to.have.ownProperty('properties');
                        expect(person).to.have.ownProperty('minProperties');
                        expect(person).to.have.ownProperty('maxProperties');
                        expect(person).to.have.ownProperty('additionalProperties');
                        expect(person).to.have.ownProperty('discriminator');
                        expect(person).to.have.ownProperty('discriminatorValue');
                    });
                });
                describe('Properties', function () {
                    var props;
                    it('Person type should contain valid properties', function () {
                        props = _.get(testType, 'Person.properties');
                        var allProps = ['firstname', 'lastname', 'age', 'title', 'country', 'test?'];
                        expect(props).to.be.a('object');
                        expect(props).to.contain.all.keys(allProps);
                    });
                    it('Required properties should have required flag checked', function () {
                        _.forEach(['firstname', 'lastname', 'age', 'test?'], function (attr) {
                            var field = props[attr];
                            expect(field).to.haveOwnProperty('required');
                            expect(field.required).to.equal(true);
                        });
                    });
                    it('Optional properties shouldn\'t have required flag', function () {
                        _.forEach(['title', 'country'], function (attr) {
                            var field = props[attr];
                            expect(field).to.haveOwnProperty('required');
                            expect(field.required).to.equal(false);
                        });
                    });
                });

                describe('Type specialization', function () {

                });
                describe('Discriminator', function () {
                    it('Type should have existing discriminator', function () {
                        var discriminator = person.discriminator;
                        expect(person.properties).to.haveOwnProperty(discriminator);
                    });
                });
            });

            describe('Array types', function () {

            });
            describe('Scalar types', function () {

            });
            describe('Examples', function () {
                it('Person type should contain example', function () {
                    var example = _.get(testType, 'Person.example');
                    expect(example).to.be.a('object');
                    expect(example).to.contain.all.keys(['firstname', 'lastname']);
                });
            });

        });

        //Checking resources
        describe('API Resources', function () {

        });

        //Checking documentations including endpoints
        describe('API Documentations', function () {

        });

    });
}
else {
    console.log('The file doesn\'t exist');
}
