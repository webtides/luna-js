#!/usr/bin/env node

const babelIgnore = (filePath) => {
    if (filePath.indexOf('node_modules') !== -1) {
        return filePath.indexOf('@webtides') === -1;
    }

    return false;
}

// We are using @babel/register to import luna-js functionality without having to
// transpile the whole package and being able to import from "@webtides/luna-js/src" instead
// of "@webtides/luna-js/lib"
require("@babel/register")({
    presets: [["@babel/preset-env", { targets: { "node": 14 }, loose: true, shippedProposals: true }]],
    plugins: [
        "@babel/plugin-proposal-nullish-coalescing-operator",
        "@babel/plugin-proposal-optional-chaining",
        [ "@babel/plugin-proposal-decorators", { legacy: true } ],
        [ "@babel/plugin-proposal-class-properties", { loose: true } ],
        "@babel/plugin-proposal-export-default-from",
        'source-map-support'
    ],
    sourceMaps: true,
    ignore: [
        babelIgnore
    ],
});

const { execute } = require("../src");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv)).argv;

execute(argv);
