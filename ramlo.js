#!/usr/bin/env node

var path = require('path');
var pkg = require(path.join(__dirname, 'package.json'));

var program = require('commander');
var raml = require('raml-1-parser');

var fs = require('fs');
var fName = path.resolve(__dirname, 'test.raml');

var api = raml.loadApiSync(fName);
//var apiResources = api.resources();
var apiResources = api.allResources();

apiResources.forEach(function(resource) {
    // console.log(resource.displayName());
    console.log(resource.kind() + ' : ' + resource.absoluteUri());

    resource.methods().forEach(function(method) {
        console.log('\t' + method.method());

        method.responses().forEach(function(response) {
            console.log('\t\t' + response.code().value());
        });
    });
});


//console.log('ramlo');
//console.log(JSON.stringify(api.toJSON(), null, 2));


// program
//     .version(pkg.version)
//     .option('-p, --port <port>', 'Port on which to listen to (defaults to 3000)', parseInt)
//     .parse(process.argv);
//
// var port = program.port || 3000;
