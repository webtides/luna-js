require("../../lib/packages/framework/bootstrap");

const path = require("path");
const {babel} = require('@rollup/plugin-babel');
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require('@rollup/plugin-json');

const settings = require(path.join(process.cwd(), "moon.config.js"));

const outputDirectory = settings.export.apiOutputDirectory || settings.export.outputDirectory;
const externals = settings.export && settings.export.api && settings.export.api.externals ? settings.export.api.externals : [];

const entryFileNames = settings.export && settings.export.api && settings.export.api.outputFilename ? settings.export.api.outputFilename : "api-server.js";

module.exports = {
    input: path.join(settings.buildDirectory, "generated/entry.apis.js"),
    output: {
        dir: outputDirectory,
        sourcemap: true,
        entryFileNames,
        format: 'cjs',
    },
    external: [
        ...externals
    ],
    plugins: [
        nodeResolve({
            resolveOnly: [ '@webtides/moon-js' ]
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
