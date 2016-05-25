
var ramlo  = require('../src/modules/api.js');
var assert = require('chai').assert;
var expect = require('chai').expect;
var fs     = require('fs');

var test1 = "test/test1/api.raml";

//make sure the path of the file is correct before running the test

if (fs.existsSync( test1 )) {

    describe('Ramlo', function() {

        describe('load raml', function () {

            var rm = ramlo( test1 );

            console.log(rm );

            it("should return an object", function(){
                expect(typeof rm).to.equal('object');
            });

            it("title should be PetShop", function(){
                expect(rm.apiTitle).to.equal("PetShop");
            });


            it("apiDescription", function(){
                expect(rm.apiDescription).to.equal(null);
            });

            it("apiDocumentations should be array", function(){
                expect( Object.prototype.toString.call( rm.apiDocumentations ) ).to.equal("[object Array]");
            });

        });
    });

}
else{
    console.log("file doesnt exist");
}