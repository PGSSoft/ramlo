var _ = require('lodash');

function uri2Identifier(uri) {
    return _.chain(uri).split('/').compact().join('-').value();
}

module.exports = {
    uri2Identifier: uri2Identifier
};