
var ramlo  = require('../src/modules/api.js');
var assert = require('chai').assert;
var expect = require('chai').expect;
var fs     = require('fs');

var test1 = "test/_test1.raml";

//make sure the path of the file is correct before running the test

if (fs.existsSync( test1 )) {

    describe('Array', function() {
        describe('#indexOf()', function () {
            it('should return -1 when the value is not present', function () {
                assert.equal(-1, [1,2,3].indexOf(5));
                assert.equal(-1, [1,2,3].indexOf(0));
            });
        });

        describe('load raml', function () {

            var rm = ramlo( test1 );

            it("should pass", function(){
                expect(rm).to.not.equal(null);
            });

        });
    });

}
else{
    console.log("file doesnt exist");
}