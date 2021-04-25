const path = require("path");
const externalGlobals = require("rollup-plugin-external-globals");

const {nodeResolve} = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');

const settings = {
    buildDirectory: 'lib',
};

function switchRenderer({ context } = { context: '' }) {
    return {
        name: 'luna-switch-renderer',
        resolveId(id) {
            if (context === 'client' && id === '@webtides/luna-renderer') {
                return require.resolve('@webtides/luna-renderer/lib/client.js');
            }
        }
    }
}

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
        switchRenderer({ context: 'client' }),
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
       // format: 'cjs'
    },
    external: [
        'glob', 'fs', 'path', '@webtides/luna-renderer'
    ],
    plugins: [
        // externalGlobals(
        //     {
        //         'lit-html': 'serverLitHtml',
        //         'lit-html/directives/unsafe-html.js': 'serverUnsafeHtml',
        //         'lit-html/directives/guard.js': 'serverGuard',
        //         'lit-html/directives/until.js': 'serverUntil',
        //     }),
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
