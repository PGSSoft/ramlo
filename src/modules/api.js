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
    var apiUriParameters = {
        /* default values */
        thead: {
            name: false,
            type: false,
            description: false,
        },
        tbody:[]
    };
    var ramlUriParameters = resource.uriParameters();

    _.forEach(ramlUriParameters, function(parameter) {

        var description = parameter.description();

        //check if type exists
        if(apiUriParameters.thead.type == false && parameter.type() != null){
            apiUriParameters.thead.type = true;
        }

        //check if description exists
        if(apiUriParameters.thead.description == false && description != null){
            apiUriParameters.thead.description = true;
        }

        //check if example exists
        if(apiUriParameters.thead.name == false && parameter.name() != null){
            apiUriParameters.thead.name = true;
        }

        apiUriParameters["tbody"].push({
            name: parameter.name(),
            type: parameter.type(),
            description: description && description.value()
        });
    });

    return apiUriParameters;
}

function produceQueryParameters(method) {
    var apiQueryParameters = {
        /* default values */
        thead: {
            name: false,
            type: false,
            description: false,
            example: false,
            default: false,
            minLength: false,
            maxLength: false
        },
        tbody:[]
    };
    var ramlQueryParameters = method.queryParameters();

    _.forEach(ramlQueryParameters, function(parameter) {

        var description = parameter.description();
        var minLength  = "";
        var maxLength  = "";

        //check if name exists
        if(apiQueryParameters.thead.name == false && parameter.name() != null){
            apiQueryParameters.thead.name = true;
        }

        //check if type exists
        if(apiQueryParameters.thead.type == false && parameter.type() != null){
            apiQueryParameters.thead.type = true;
        }

        //check if description exists
        if(apiQueryParameters.thead.description == false && description != null){
            apiQueryParameters.thead.description = true;
        }

        //check if example exists
        if(apiQueryParameters.thead.example == false && parameter.example() != null){
            apiQueryParameters.thead.example = true;
        }

        //check if default exists
        if(apiQueryParameters.thead.default == false && parameter.default() != null){
            apiQueryParameters.thead.default = true;
        }

        try{
            /* note: parameter.minLength() & parameter.maxLength() throws an error if no minLength | maxLength exists
                    it is an error from the parser, try...catch solves the problem
             */
            if(apiQueryParameters.thead.minLength == false && parameter.minLength() != null){
                apiQueryParameters.thead.minLength = true;
                minLength = parameter.minLength();
            }
        }
        catch(err){}

        try{
            if(apiQueryParameters.thead.maxLength == false && parameter.maxLength() != null){
                apiQueryParameters.thead.maxLength = true;
                maxLength = parameter.maxLength();
            }
        }
        catch(err){}


        apiQueryParameters["tbody"].push({
            name: parameter.name(),
            type: parameter.type(),
            isRequired: parameter.required(),
            description: description && description.value(),
            example: parameter.example(),
            default: parameter.default(),
            minLength: minLength,
            maxLength: maxLength,
            repeat: parameter.repeat()
        });
    });

    return apiQueryParameters;
}

function produceRequestBody(method) {
    var apiBodySchema = {
        thead: {
        },
        tbody: []
    };

    var ramlBody = method.body();

    if(Object.keys(ramlBody).length > 0){

        //expecting only 1 value to be valid
        //there should NOT be 2 or more "body" declarations

        _.forEach(ramlBody, function (body) {

            if(body.schemaContent() != null ){
                var sp = produceSchemaParameters(body.schemaContent());

                //make sure that "body" key was valid
                if(sp["tbody"].length > 0 ){
                    apiBodySchema = sp;
                }

            }
        });
    }

    console.log("*", apiBodySchema);

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

                //check if NULL before calling produceSchemaParameters()

                var sch = body.schemaContent();

                if(sch != null && typeof sch != "undefined"){
                    schemaProperties = produceSchemaParameters( sch );
                }

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

    var schemaProperties = {
        thead: {
            name: true,
            type: false,
            description: false,
            example: false,
            default: false
        },
        tbody:[]
    };


    //before calling JSON.parse, make sure the string is valid json
    //using try/catch solved errors, ex. https://github.com/raml-apis/Instagram
    try{
        var schemaObject = _.isObject(schemaContent) ? schemaContent : JSON.parse(schemaContent);
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

                //check if description exists
                if(schemaProperties.thead.description == false && value.description != null){
                    schemaProperties.thead.description = true;
                }

                if(schemaProperties.thead.type == false && value.type != null){
                    schemaProperties.thead.type = true;
                }

                schemaProperties["tbody"].push({
                    name: key,
                    type: value.type,
                    description:  value.description,
                    isRequired: value.required,
                    nestedProperties: nestedProperties
                });
            });
        }
    }
    catch(err){
        console.log( err ,  schemaContent);
        console.log( "////////////////////////////////////////////////////" );
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