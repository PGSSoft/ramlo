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

console.time('ramlo');

if (program.file) {
    var fName = path.resolve(process.cwd(), program.file);
    var api = raml.loadApiSync(fName);

    var apiResources = [];
    var resources = api.resources();

    // create list of resources (root level)
    resources.forEach(function(resource) {
        var endpoints = [];

        // get methods of main resources
        resource.methods().forEach(function(method) {
            var example = '';

            method.responses().forEach(function(response) {
                response.body().forEach(function(body) {
                    example = body.toJSON().example;
                });
            });

            endpoints.push({
                method: method.method(),
                uri: resource.completeRelativeUri(),
                description: method.description() && method.description().value(),
                example: example
            });
        });

        // get methods of resources at 2. level
        // TODO: refactor this function to use recursion
        resource.resources().forEach(function(resource) {
            var uriParameters = [];
            var queryParameters = [];

            resource.uriParameters().forEach(function(parameter) {
                uriParameters.push({
                    name: parameter.name(),
                    description: parameter.description() && parameter.description().value()
                });
            });

            resource.methods().forEach(function(method) {
                var example = '';
                var schema = '';

                method.queryParameters().forEach(function(parameter) {
                    queryParameters.push({
                        name: parameter.name(),
                        type: parameter.type(),
                        description: parameter.description() && parameter.description().value()
                    });
                });

                method.responses().forEach(function(response) {
                    response.body().forEach(function(body) {
                        schema = body.schemaContent();
                        example = body.toJSON().example;
                    });
                });

                endpoints.push({
                    method: method.method(),
                    uri: resource.completeRelativeUri(),
                    description: method.description() && method.description().value(),
                    uriParameters: uriParameters,
                    queryParameters: queryParameters,
                    schema: schema,
                    example: example
                });
            });
        });

        apiResources.push({
            name: resource.displayName(),
            endpoints: endpoints
        });
    });

    // pass variables to jade template
    var locals = {
        ramlVersion: api.RAMLVersion(),
        apiTitle: api.title(),
        apiDescription: api.description() && api.description().value(),
        apiBaseUri: api.baseUri().value().replace('{version}', api.version()),
        apiResources: apiResources
    };
    // console.log(JSON.stringify(locals));

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
    fs.writeFileSync(path.resolve(process.cwd(), 'api.html'), html);
}
else {
    program.outputHelp();
}

console.timeEnd('ramlo');

//resources
//nestedResources