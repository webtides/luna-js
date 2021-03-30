#!/usr/bin/env node

const { execute } = require("../lib");
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

execute(argv);
