const path = require("path");
const externalGlobals = require("rollup-plugin-external-globals");

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
        format: 'cjs'
    },
    external: [
        'glob', 'fs', 'path', 'buffer', 'stream'
    ],
    plugins: [
        nodeResolve({
            preferBuiltins: true,
            only: ['@webtides/element-js', "lit-html"]
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
        externalGlobals(
            {
                'lit-html': 'serverLitHtml',
                'lit-html/directives/unsafe-html': 'serverUnsafeHtml',
                'lit-html/directives/guard': 'serverGuard',
                'lit-html/directives/until': 'serverUntil',
            }),
        nodeResolve({
            preferBuiltins: true,
            only: ['@webtides/element-js', "@popeindustries/lit-html-server"]
        }),
        babel({
            configFile: path.resolve(__dirname, "../..", 'babel.config.js')
        }),
        json()
    ]
};

module.exports = [ clientBundle, serverBundle ];
