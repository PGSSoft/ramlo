var _ = require('lodash');

function uri2Identifier(uri) {
    return _.chain(uri).split('/').compact().join('-').value();
}

function uriWithMethodIdentifier(uri, method) {
    return uri2Identifier(uri).concat('-', method);
}

module.exports = {
    uri2Identifier: uri2Identifier,
    uriWithMethodIdentifier: uriWithMethodIdentifier
};