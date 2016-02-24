#!/usr/bin/env node

var path = require('path');
var pkg = require(path.join(__dirname, 'package.json'));

var program = require('commander');
var raml = require('raml-1-parser');

var fs = require('fs');

program
    .version(pkg.version)
    .option('-f, --file [path]', 'RAML file')
    .parse(process.argv);

if (program.file) {
    var fName = path.resolve(process.cwd(), program.file);
    var api = raml.loadApiSync(fName);
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

     // console.log(JSON.stringify(api.toJSON(), null, 2));
}