# ramlo
[![node](https://img.shields.io/node/v/gh-badges.svg)]()
[![npm](https://img.shields.io/npm/v/npm.svg)]()

Command line tool based on Node.js for generating RESTful API documentations written in [RAML](http://raml.org/).

## Note
It is currently during development and uses [RAML 1.0 JS Parser (beta)](https://github.com/raml-org/raml-js-parser-2), so can be highly unstable.

It supports both RAML [0.8](http://raml.org/raml-08-spec) and [1.0](http://raml.org/raml-10-spec).

## Instalation
```
npm install -g ramlo
```

## Usage
```
ramlo -f ramlFile.raml
```

The output of this command is a HTML file called `apidoc.html` which should have RESTful API documentation generated based on provided RAML file.

## Example
If you do not have any API documented in RAML you can look at my other project called [Manageably](https://github.com/zkamil/manageably-doc).

For generating documentation please use API described in file `manageably-1.0.raml`.

## License
ISC
