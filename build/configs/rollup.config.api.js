require("../../lib/packages/framework/bootstrap");

const path = require("path");
const {babel} = require('@rollup/plugin-babel');
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require('@rollup/plugin-json');

const settings = require(path.join(process.cwd(), "moon.config.js"));

const outputDirectory = settings.export.apiOutputDirectory || settings.export.outputDirectory;
const externals = settings.export && settings.export.api && settings.export.api.externals ? settings.export.api.externals : [];

module.exports = {
    input: path.join(settings.buildDirectory, "generated/entry.apis.js"),
    output: {
        dir: outputDirectory,
        sourcemap: true,
        entryFileNames: "api-server.js",
        format: 'cjs',
    },
    external: [
        ...externals
    ],
    plugins: [
        nodeResolve({
            moduleDirectories: [
                path.join(process.cwd(), "node_modules"),
                // These two here are necessary for locally linked modules. Generally they should have no effect.
                path.join(process.cwd(), "node_modules/@webtides/moon-js/node_modules"),
                path.join(process.cwd(), "node_modules/@webtides/moon-js/node_modules/express/node_modules"),
            ]
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
