const path = require("path");

const glob = require("glob-all");
const { nodeResolve } = require('@rollup/plugin-node-resolve/dist/cjs');
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');

const settings = {
    buildDirectory: 'lib',
};

module.exports = {
    input: "index.js",
    output: {
        dir: settings.buildDirectory,
        entryFileNames: '[name].js',
        sourcemap: true,
        format: 'cjs'
    },
    external: [
        'glob', 'fs', 'path'
    ],
    plugins: [
        nodeResolve({
            preferBuiltins: true,
            only: [ '@webtides/element-js' ]
        }),
        babel({
            configFile: path.resolve(__dirname, 'babel.config.js')
        }),
        json()
    ]
}
