var ramloApi = require('../src/modules/api.js');
var assert = require('chai').assert;
var expect = require('chai').expect;
var fs = require('fs');

var test1 = "test/test1/api.raml";
var annotations = "test/annotations/api.raml"; // ? ERROR: strange infinite loop on test, but no crash on api - that's what happens when you use the same variable for inner loop :)
var libraries = "test/libraries/api.raml"; //
var overlays = "test/overlays/api.raml"; //working correctly
var extended = "test/extended/api.raml"; // ? missing protocols, mediaType, securedBy

var test = annotations;

// separate tests
var rootTest = require('./roots/test');

//make sure the path of the file is correct before running the test
if (fs.existsSync(test)) {
    describe('Ramlo', function () {

        var rm = ramloApi(test);

        rootTest();

        describe("check types", function () {

            it("apiDescription should be string", function () {
                //expect(rm.apiDescription).to.equal('');
                expect(rm.apiDescription).to.be.a('string');
            });

            it("apiResources should be array", function () {
                expect(rm.apiResources).to.be.a('array');
            });

            it("apiDocumentations should be array", function () {
                expect(rm.apiDocumentations).to.be.a("array");
            });
        });

        describe("check apiResources", function () {

            for (var i = 0; i < rm.apiResources.length; i++) {

                var o = rm.apiResources[i];

                it("should have property uri", function () {
                    expect(o).to.have.ownProperty("uri");

                });
                it("should have property name", function () {
                    expect(o).to.have.ownProperty("name");
                });
                it("should have property description", function () {
                    expect(o).to.have.ownProperty("description");
                });
                it("should have property endpoints", function () {
                    expect(o).to.have.ownProperty("endpoints");
                });

//console.log(o.endpoints);
                for (var j in o.endpoints) {
                    console.log(o.endpoints[j]);
                }
            }

        });

        describe("check apiDocumentations", function () {

            for (var i = 0; i < rm.apiDocumentations.length; i++) {

                var o = rm.apiDocumentations[i];

            }

        });

    });

}
else {
    console.log("file doesn't exist");
}
