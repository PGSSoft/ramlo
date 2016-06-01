
var ramlo  = require('../src/modules/api.js');
var assert = require('chai').assert;
var expect = require('chai').expect;
var fs     = require('fs');

var test1 = "test/test1/api.raml";
var annotations = "test/annotations/api.raml"; // ? ERROR: strange infinite loop on test, but no crash on api
var libraries = "test/libraries/api.raml"; //
var overlays = "test/overlays/api.raml"; //working correctly
var extended = "test/extended/api.raml"; // ? missing protocols, mediaType, securedBy

var test = annotations;

//make sure the path of the file is correct before running the test

if (fs.existsSync( test )) {

    describe('Ramlo', function() {

        var rm = ramlo( test );
console.log(rm);
        describe('load raml', function () {

            it("should return an object", function(){
                expect(typeof rm).to.equal('object');
            });
            
            it("should have property apiTitle", function(){
                expect(rm).to.have.ownProperty("apiTitle");
            });
            it("should have property apiDocumentations", function(){
                expect(rm).to.have.ownProperty("apiDocumentations");
            });
            it("should have property apiDescription", function(){
                expect(rm).to.have.ownProperty("apiDescription");
            });
            it("should have property apiDescription", function(){
                expect(rm).to.have.ownProperty("apiDescription");
            });
            it("should have property apiBaseUri", function(){
                expect(rm).to.have.ownProperty("apiBaseUri");
            });
            it("should have property apiResources", function(){
                expect(rm).to.have.ownProperty("apiResources");
            });

        });

        describe("check types", function () {
            it("title should be PetShop", function(){
                //expect(rm.apiTitle).to.equal("PetShop");
            });

            it("apiDescription", function(){
                expect(rm.apiDescription).to.equal(null);
            });

            it("apiResources", function(){
                expect(rm.apiResources).to.be.a('array');
            });

            it("apiDocumentations should be array", function(){
                expect( rm.apiDocumentations ).to.be.a("array");
            });
        });

        describe("check apiResources", function () {

            for(var i = 0; i < rm.apiResources.length ; i++){

                var o = rm.apiResources[i];

                it("should have property apiDescription", function(){
                    expect(o).to.have.ownProperty("uri");
                });
                it("should have property apiDescription", function(){
                    expect(o).to.have.ownProperty("name");
                });
                it("should have property apiBaseUri", function(){
                    expect(o).to.have.ownProperty("description");
                });
                it("should have property apiResources", function(){
                    expect(o).to.have.ownProperty("endpoints");
                });

                for(var i in o.endpoints){
                    //console.log(o.endpoints[i]);
                }
            }

        });

    });

}
else{
    console.log("file doesnt exist");
}