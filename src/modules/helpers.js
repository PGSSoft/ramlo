var _ = require('lodash');

function uri2Identifier(uri) {
    return _.chain(uri).split('/').compact().join('-').replace(/{/g,"__").replace(/}/g,"__").value();
}

function uriWithMethodIdentifier(uri, method) {
    return uri2Identifier(uri).concat('-', method).replace(/{/g,"__").replace(/}/g,"__");
}

module.exports = {
    uri2Identifier: uri2Identifier,
    uriWithMethodIdentifier: uriWithMethodIdentifier
};