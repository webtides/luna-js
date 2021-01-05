#!/usr/bin/env node

const { execute } = require("../lib/packages/cli/entry");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

global.moon = {
    currentWorkingDirectory: process.cwd(),
    currentDirectory: path.dirname(__dirname)
}

const argv = yargs(hideBin(process.argv)).argv;

execute(argv);
