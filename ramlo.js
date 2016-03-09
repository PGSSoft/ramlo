#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var program = require('commander');
var raml = require('raml-1-parser');
var sass = require('node-sass');
var jade = require('jade');
var pkg = require(path.join(__dirname, 'package.json'));

program
    .version(pkg.version)
    .option('-f, --file [path]', 'RAML file')
    .parse(process.argv);

if (program.file) {
    var fName = path.resolve(process.cwd(), program.file);
    var api = raml.loadApiSync(fName);

    var apiResources = [];
    var resources = api.resources();

    resources.forEach(function(resource) {
        var apiMethods = [];

        resource.methods().forEach(function(method) {
            var queryParameters = [];

            method.queryParameters().forEach(function(parameter) {
                queryParameters.push({
                    name: parameter.name(),
                    type: parameter.type()
                });
            });

            apiMethods.push({
                name: method.method(),
                parameters: queryParameters
            });
        });

        apiResources.push({
            name: resource.displayName(),
            uri: resource.completeRelativeUri(),
            methods: apiMethods
        });
    });

    /**
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
    **/

    // pass variables to jade template
    var locals = {
        apiTitle: api.title(),
        apiDescription: api.description().value(),
        ramlVersion: api.RAMLVersion(),
        apiResources: apiResources
    };
    console.log(JSON.stringify(locals));

    // compile sass styles
    var scss = sass.renderSync({
        file: path.join(__dirname, 'src/main.scss'),
        outputStyle: 'compressed',
        outFile: path.join(__dirname, 'src/main.css'),
        sourceMap: false
    });

    // save css file which will be included in html file
    fs.writeFileSync(path.join(__dirname, 'src/main.css'), scss.css);

    // render html from jade template
    var html = jade.renderFile(path.join(__dirname, 'src/index.jade'), locals);

    // save html file with documentation
    fs.writeFileSync(path.resolve(process.cwd(), 'apidoc.html'), html);
}
else {
    program.outputHelp();
}