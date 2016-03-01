#!/usr/bin/env node

var path = require('path');
var pkg = require(path.join(__dirname, 'package.json'));

var program = require('commander');
var raml = require('raml-1-parser');

var fs = require('fs');

var sass = require('node-sass');
var jade = require('jade');

program
    .version(pkg.version)
    .option('-f, --file [path]', 'RAML file')
    .parse(process.argv);

if (program.file) {
    var fName = path.resolve(process.cwd(), program.file);
    var api = raml.loadApiSync(fName);
    var apiResources = api.allResources();
    var resources = [];

    apiResources.forEach(function(resource) {
        // console.log(resource.displayName());
        //console.log(resource.kind() + ' : ' + resource.absoluteUri());
        resources.push(resource.absoluteUri());

        resource.methods().forEach(function(method) {
            //console.log('\t' + method.method());

            method.responses().forEach(function(response) {
                //console.log('\t\t' + response.code().value());
            });
        });
    });

    var locals = {
        pageTitle: 'ramlo',
        resources: resources
    };

    //console.log(locals);

    var scss = sass.renderSync({
        file: path.join(__dirname, 'src/main.scss'),
        outputStyle: 'compressed',
        outFile: path.join(__dirname, 'src/main.css'),
        sourceMap: false
    });
    var html = jade.renderFile(path.join(__dirname, 'src/index.jade'), locals);

    fs.writeFile(path.join(__dirname, 'src/main.css'), scss.css);
    fs.writeFile(path.resolve(process.cwd(), 'apidoc.html'), html);

     // console.log(JSON.stringify(api.toJSON(), null, 2));
}