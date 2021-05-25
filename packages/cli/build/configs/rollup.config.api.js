const path = require("path");
const {babel} = require('@rollup/plugin-babel');
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require('@rollup/plugin-json');

const { getSettings } = require('@webtides/luna-js/src/framework/config');

const settings = getSettings();

const outputDirectory = settings.export?.api?.output?.directory ?? settings.export.output;
const externals = settings.export?.api?.externals ?? [];

const entryFileNames = settings.export?.api?.output.filename ?? 'api-server.js';

const production = process.env.NODE_ENV === "production";

module.exports = {
    input: path.join(settings._generated.baseDirectory, "entry.apis.js"),
    output: {
        dir: outputDirectory,
        sourcemap: !production,
        entryFileNames,
        format: 'cjs',
    },
    external: [
        ...externals
    ],
    plugins: [
        require("../plugins/rollup-plugin-markdown.js")(),
        nodeResolve({
            resolveOnly: [ '@webtides/luna-js', '@webtides/luna-cli' ]
        }),
        commonjs({ requireReturnsDefault: true }),
        babel({
            configFile: path.resolve(__dirname, "../..", 'babel.config.js'),
            babelHelpers: "bundled"
        }),
        json(),
        require("../plugins/rollup-plugin-export")({ outputDirectory, externals })
    ]
}
