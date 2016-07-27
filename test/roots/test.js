'use strict';

var ramloApi = require('../../src/modules/api.js');
var assert = require('chai').assert;
var expect = require('chai').expect;
var fs = require('fs');

var test = "test/roots/api.raml";

//make sure the path of the file is correct before running the test
module.exports = function () {
    if (fs.existsSync(test)) {
        describe('Root test', function () {

            var rm = ramloApi(test);

            describe('check properties', function () {
                it("should return an object", function () {
                    expect(typeof rm).to.equal('object');
                });
                it("should have property ramlVersion", function () {
                    expect(rm).to.have.ownProperty("ramlVersion");
                });

                it("should have property apiTitle", function () {
                    expect(rm).to.have.ownProperty("apiTitle");
                });
                it("should have property apiDescription", function () {
                    expect(rm).to.have.ownProperty("apiDescription");
                });
                it("should have property apiVersion", function () {
                    expect(rm).to.have.ownProperty("apiVersion");
                });
                it("should have property apiBaseUri", function () {
                    expect(rm).to.have.ownProperty("apiBaseUri");
                });
                it("should have property baseUriParameters", function () {
                    expect(rm).to.have.ownProperty("baseUriParameters");
                });
                it("should have property apiProtocol", function () {
                    expect(rm).to.have.ownProperty("apiProtocol");
                });
                it("should have property apiDocumentations", function () {
                    expect(rm).to.have.ownProperty("apiDocumentations");
                });
                it("should have property apiResources", function () {
                    expect(rm).to.have.ownProperty("apiResources");
                });
            });

            describe('check prop values', function () {
                it("title should be Example API", function () {
                    expect(rm.apiTitle).to.equal("Example API");
                });
                it('apiDescription should be formatted in markdown', function () {
                    expect(rm.apiDescription).to.contain("<p>").and.contain("</p>");
                });
                it('apiVersion should equal "v2"', function () {
                    expect(rm.apiVersion).to.equal("v2");
                });
            });

        });

    }
    else {
        console.log("file doesn't exist");
    }
};
