var raml = require('raml-1-parser');
var _ = require('lodash');
var hljs = require('highlight.js');
var chalk = require('chalk');

var ramlo = {};

function produceDescription(api) {
    var description = api.description();

    return description && description.value();
}

function produceDocumentations(api) {
    var apiDocumentations = [];
    var ramlDocumentations = api.documentation();

    _.forEach(ramlDocumentations, function(documentation) {
        var content = documentation.content();

        apiDocumentations.push({
            title: documentation.title(),
            content: content && content.value()
        });
    });

    return apiDocumentations;
}

function produceResources(api) {
    var apiResources = [];
    var ramlResources = api.resources();

    _.forEach(ramlResources, function(resource) {
        var uri = resource.completeRelativeUri();
        var name = resource.displayName() || capitalizeFirstLetter(uri.replace('/', ''));

        apiResources.push({
            uri: uri,
            name: name,
            endpoints: _.flattenDeep(produceEndpoints(resource))
        });
    });

    return apiResources;
}

function produceEndpoints(resource) {
    var endpoints = [];
    var ramlNestedResources = resource.resources();
    var ramlMethods = resource.methods();

    _.forEach(ramlMethods, function(method) {
        var description = method.description();

        endpoints.push({
            uri: resource.completeRelativeUri(),
            method: method.method(),
            description: description && description.value(),
            uriParameters: produceUriParameters(resource),
            queryParameters: produceQueryParameters(method),
            requestBody: produceRequestBody(method),
            responseBody: produceResponseBody(method),
            responseExample: produceResponseExample(method)
        });
    });

    if (ramlNestedResources.length) {
        _.forEach(ramlNestedResources, function(resource) {
            endpoints.push(produceEndpoints(resource));
        })
    }

    return endpoints;
}

function produceUriParameters(resource) {
    var apiUriParameters = [];
    var ramlUriParameters = resource.uriParameters();

    _.forEach(ramlUriParameters, function(parameter) {
        var description = parameter.description();

        apiUriParameters.push({
            name: parameter.name(),
            type: parameter.type(),
            description: description && description.value()
        });
    });

    return apiUriParameters;
}

function produceQueryParameters(method) {
    var apiQueryParameters = [];
    var ramlQueryParameters = method.queryParameters();

    _.forEach(ramlQueryParameters, function(parameter) {
        var description = parameter.description();

        apiQueryParameters.push({
            name: parameter.name(),
            type: parameter.type(),
            description: description && description.value(),
            repeat: parameter.repeat()
        });
    });

    return apiQueryParameters;
}

function produceRequestBody(method) {
    var apiBodySchema = [];
    var ramlBody = method.body();

    _.forEach(ramlBody, function(body) {
        //apiBodySchema = produceSchemaParameters(body.schemaContent());
    });

    return apiBodySchema;
}

function produceResponseBody(method) {
    var ramlResponses = method.responses();
    var ramlBodies;
    var schemaProperties = [];

    _.forEach(ramlResponses, function(response) {
        if (response.code().value() === '200') {
            ramlBodies = response.body();

            _.forEach(ramlBodies, function(body) {
                schemaProperties = produceSchemaParameters(body.schemaContent());
            });
        }
    });

    return schemaProperties;
}

function produceResponseExample(method) {
    var apiExample = '';
    var ramlResponses = method.responses();
    var ramlBodies;

    _.forEach(ramlResponses, function(response) {
        if (response.code().value() === '200') {
            ramlBodies = response.body();

            _.forEach(ramlBodies, function(body) {
                apiExample = body.toJSON().example;
                apiExample = apiExample && hljs.highlight('json', apiExample).value;
            });
        }
    });

    return apiExample;
}

function produceSchemaParameters(schemaContent) {
    var schemaObject = _.isObject(schemaContent) ? schemaContent : JSON.parse(schemaContent);
    var schemaProperties = [];
    var nestedProperties;

    if (_.has(schemaObject, 'items')) {
        schemaObject = schemaObject.items;
    }

    if (_.has(schemaObject, 'properties')) {
        _.forOwn(schemaObject.properties, function(value, key) {
            nestedProperties = [];

            if (_.has(value, 'items')) {
                value = value.items;
            }

            if (_.has(value, 'properties')) {
                nestedProperties = produceSchemaParameters(value);
            }

            schemaProperties.push({
                name: key,
                type: value.type,
                description: value.description,
                isRequired: value.required,
                nestedProperties: nestedProperties
            });
        });
    }

    return schemaProperties;
}

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

module.exports = function(ramlFile) {
    var api;

    try {
        api = raml.loadApiSync(ramlFile);
    }
    catch(e) {
        console.log(chalk.red('provided file is not a correct RAML file!'));
        process.exit(1);
    }

    ramlo.ramlVersion = api.RAMLVersion();
    ramlo.apiTitle = api.title();
    ramlo.apiDescription = produceDescription(api);
    ramlo.apiBaseUri = api.baseUri().value().replace('{version}', api.version());
    ramlo.apiDocumentations = produceDocumentations(api);
    ramlo.apiResources = produceResources(api);

    return ramlo;
};