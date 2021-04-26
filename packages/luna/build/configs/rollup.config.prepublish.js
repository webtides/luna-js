const path = require("path");

const {nodeResolve} = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');

const settings = {
    buildDirectory: 'lib',
};

const clientBundle = {
    input: "index.js",
    output: {
        dir: settings.buildDirectory,
        entryFileNames: 'client.js',
        sourcemap: true,
        format: 'es'
    },
    external: [
        'glob', 'fs', 'path', 'buffer', 'stream'
    ],
    plugins: [
        nodeResolve({
            preferBuiltins: true,
            only: ['@webtides/element-js']
        }),
        babel({
            configFile: path.resolve(__dirname, "../..", 'babel.config.js')
        }),
        json()
    ]
};

const serverBundle = {
    input: "index.js",
    output: {
        dir: settings.buildDirectory,
        entryFileNames: 'server.js',
        sourcemap: true,
    },
    external: [
        'glob', 'fs', 'path'
    ],
    plugins: [
        nodeResolve({
            preferBuiltins: true,
            only: ['@webtides/element-js']
        }),
        babel({
            configFile: path.resolve(__dirname, "../..", 'babel.config.js')
        }),
        json()
    ]
};

module.exports = [ clientBundle, serverBundle ];
