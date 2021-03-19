#!/usr/bin/env node

const { execute } = require("../lib");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

global.moonCli = {
    currentWorkingDirectory: process.cwd(),
    currentDirectory: path.dirname(__dirname),
}

const argv = yargs(hideBin(process.argv)).argv;

global.moonIsExporting = !!argv.export;

execute(argv);
