#!/usr/bin/env node

const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv)).argv;

global.lunaCli = {
    currentWorkingDirectory: process.cwd(),
    currentDirectory: path.dirname(__dirname),
    isExporting: !!argv.export,
    documentInject: ''
}

const { execute } = require("../lib");

execute(argv);
