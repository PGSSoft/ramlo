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
                        var allProps = ['firstname', 'lastname', 'age', 'title', 'country', 'test?', 'optional?'];
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
                        _.forEach(['title', 'country', 'optional?'], function (attr) {
                            var field = props[attr];
                            expect(field).to.haveOwnProperty('required');
                            expect(field.required).to.equal(false);
                        });
                    });
                    //TODO check the validity of additionalProperties
                });

                describe('Type specialization', function () {
                    var extendType = _.find(rm.apiAllTypes, 'Employee');
                    it('Data types should contain the Employee type', function () {
                        expect(extendType).to.be.a('object');
                    });
                    it('Employee subtype should extend Person type');
                    it('Employee should override the Person\'s properties');

                });
                describe('Discriminator', function () {
                    it('Type should have existing discriminator', function () {
                        var discriminator = person.discriminator;
                        expect(person.properties).to.haveOwnProperty(discriminator);
                    });
                    it('Type should have valid discriminatorValue', function () {
                        expect(person.discriminatorValue).to.be.a('string');
                    });
                });
            });

            describe('Array types', function () {
                var mailbox;
                before(function () {
                    mailbox = _.find(rm.apiAllTypes, 'Mailbox').Mailbox;
                });
                describe('Array facets', function () {
                    it('Mailbox should be an array', function () {
                        expect(mailbox).to.haveOwnProperty('type');
                        expect(mailbox.type).to.contain('array');
                    });
                    it('Mailbox type should have all standard facets', function () {
                        expect(mailbox).to.have.ownProperty('items');
                        expect(mailbox).to.have.ownProperty('minItems');
                        expect(mailbox).to.have.ownProperty('maxItems');
                        expect(mailbox).to.have.ownProperty('uniqueItems');
                    });
                });
            });
            describe('Scalar types', function () {
                //TODO Basic tests for all scalar types
            });
            describe('Examples', function () {
                it('Person type should contain example', function () {
                    var example = _.get(testType, 'Person.example');
                    expect(example).to.be.a('object');
                    expect(example).to.contain.all.keys(['firstname', 'lastname']);
                });
                it('Mailbox array example');
                it('String pattern example');
                it('File type example');
                it('Union type example');
            });

        });

        ////
        //Checking resources (including endpoints)
        describe('API Resources', function () {
            var testResource = null;
            var companies;
            before(function () {
                //console.log(rm.apiResources);
                //console.log(rm.apiResources[0].endpoints);
                companies = _.find(rm.apiResources, {uri: '/companies'});
            });
            describe('Resources basics', function () {
                before(function () {
                });
                it('All resources begin with a "/"', function () {
                    _.forEach(rm.apiResources, function (res) {
                        _.forEach(res.endpoints, function (endpoint) {
                            expect(endpoint).to.haveOwnProperty('uri');
                            expect(endpoint.uri.charAt(0)).to.equal('/');
                        });
                    });
                });
                it('Resources should have sample Resource "/companies"', function () {
                    expect(companies).to.be.a('object');
                });
                it('Companies resource should have displayName', function () {
                    expect(companies).to.haveOwnProperty('name');
                });
                it('Companies resource should have description', function () {
                    expect(companies).to.haveOwnProperty('description');
                });
                it('Companies resource should have methods get, and post', function () {
                    expect(companies).to.haveOwnProperty('endpoints');
                    expect(_.find(companies.endpoints, {method: 'get'})).to.be.a('object');
                    expect(_.find(companies.endpoints, {method: 'post'})).to.be.a('object');
                });
                //TODO test for traits and resource types in resources
                //TODO test for security schemes
                //TODO annotations in resources

            });
            describe('Template URIs and URI parameters', function () {
                it('Resources should have a valid URI parameter', function () {

                });
                it('Resources should have an "ext" reserved URI parameter');
            });
            describe('Nested resources', function () {
                it('Resource companies contains all the nested resources', function () {
                    expect(_.filter(companies.endpoints, {uri: '/companies/{id}', method: 'get'})).to.be.a('array');
                    expect(_.filter(companies.endpoints, {
                        uri: '/companies/{id}/employees-{ext}',
                        method: 'get'
                    })).to.be.a('array');
                    expect(_.filter(companies.endpoints, {
                        uri: '/companies/{id}/employees-{ext}/{employeeId}'
                    })).to.be.a('array');
                    expect(_.filter(companies.endpoints, {
                        uri: '/companies/{id}/employees-{ext}/{employeeId}/projects'
                    })).to.be.a('array');
                });
            });
        });

        //Checking methods
        describe('API Methods', function () {
            describe('Methods basics', function () {
                it('Should handle all types of methods', function () {

                });
            });
        });

    });
}
else {
    console.log('The file doesn\'t exist');
}
