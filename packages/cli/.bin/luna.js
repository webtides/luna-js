#!/usr/bin/env node

const babelIgnore = (filePath) => {
    if (filePath.indexOf('node_modules') !== -1) {
        return filePath.indexOf('@webtides') === -1;
    }

    return false;
}

require("@babel/register")({
    presets: [["@babel/preset-env", { targets: { "node": 14 }, loose: true, shippedProposals: true }]],
    plugins: [
        "@babel/plugin-proposal-nullish-coalescing-operator",
        "@babel/plugin-proposal-optional-chaining",
        [ "@babel/plugin-proposal-decorators", { legacy: true } ],
        [ "@babel/plugin-proposal-class-properties", { loose: true } ],
        "@babel/plugin-proposal-export-default-from",
    ],
    ignore: [
        babelIgnore
    ],
});

const { execute } = require("../src");
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
