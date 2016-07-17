#!/usr/bin/env node

'use strict';

console.log('starting ramlo...');
console.log('loading dependencies...');
console.time('[ramlo_dependencies]');

var path = require('path');
var fs = require('fs');

var program = require('commander');
var chalk = require('chalk');
var jade = require('jade');

var pkg = require(path.join(__dirname, '../package.json'));
var api = require('../src/modules/api');
var helpers = require('../src/modules/helpers');

console.timeEnd('[ramlo_dependencies]');

program
    .version(pkg.version)
    .option('-f, --file <path>', 'RAML input file')
    .option('-o, --output <path>', 'HTML output file')
    .parse(process.argv);

if (program.file) {
    var docFile = path.resolve(process.cwd(), path.dirname(program.file), program.output || 'index.html');

    console.log('creating documentation...');
    console.time('[ramlo_parsing]');

    // check if RAML file exists
    var ramlFile = path.resolve(process.cwd(), program.file);

    try {
        fs.statSync(ramlFile);
    }
    catch (e) {
        console.log(chalk.red('provided file does not exist!'));
        process.exit(1);
    }

    // convert RAML to API object
    var ramlApi = api(ramlFile);

    // render html from jade template
    var html = jade.renderFile(path.join(__dirname, '../src/index.jade'), { api: ramlApi, helpers: helpers });

    // save html file with documentation
    fs.writeFileSync(docFile, html);

    console.timeEnd('[ramlo_parsing]');
    console.log('documentation created');
}

if (!process.argv.slice(2).length) {
    program.help();
}
