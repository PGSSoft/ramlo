#!/usr/bin/env node

var path = require('path');
var fs = require('fs');

var program = require('commander');
var chalk = require('chalk');
var sass = require('node-sass');
var jade = require('jade');
var uglify = require('uglify-js');

var pkg = require(path.join(__dirname, 'package.json'));
var api = require('./src/modules/api');
var helpers = require('./src/modules/helpers');

program
    .version(pkg.version)
    .option('-f, --file <path>', 'RAML input file')
    .option('-o, --output <path>', 'HTML output file')
    .parse(process.argv);

if (program.file) {
    var docFile = path.resolve(process.cwd(), path.dirname(program.file), program.output || 'index.html');

    console.log(chalk.blue('starting ramlo...'));
    console.time('time');

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

    // compile sass styles
    var scss = sass.renderSync({
        file: path.join(__dirname, 'src/main.scss'),
        outputStyle: 'compressed',
        outFile: path.join(__dirname, 'src/main.css'),
        sourceMap: false
    });

    var minjs = uglify.minify(path.join(__dirname, 'src/index.js'));

    // save css file which will be included in html file
    fs.writeFileSync(path.join(__dirname, 'src/main.css'), scss.css);

    fs.writeFileSync(path.join(__dirname, 'src/index.min.js'), minjs.code);

    // render html from jade template
    var html = jade.renderFile(path.join(__dirname, 'src/index.jade'), {api: ramlApi, helpers: helpers});

    // save html file with documentation
    fs.writeFileSync(docFile, html);

    console.timeEnd('time');
    console.log(chalk.green('finished'));
}
else {
    program.outputHelp();
}