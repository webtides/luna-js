require("@webtides/luna-js/lib/framework/bootstrap");

const path = require("path");
const glob = require("glob-all");
const { terser } = require("rollup-plugin-terser");
const {babel} = require('@rollup/plugin-babel');
const multi = require("@rollup/plugin-multi-entry");
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const postcss = require('../plugins/rollup-plugin-postcss');
const strip = require("../plugins/rollup-plugin-strip-server-code");
const copy = require("../plugins/rollup-plugin-copy");

const production = process.env.NODE_ENV === "production";
const settings = require(path.join(process.cwd(), "luna.config.js"));

const legacyComponentBundles = settings.componentsDirectory
    .map(bundle => {
        const inputFiles = glob.sync([
            path.join(bundle.basePath, bundle.directory, "**/*.js")
        ]);

        if (inputFiles.length === 0) {
            return false;
        }

        return {
            input: [path.join(settings.buildDirectory, "generated/entry.legacy.js")],
            output: {
                dir: bundle.outputDirectory,
                sourcemap: !production,
                entryFileNames: "bundle.legacy.js",
                format: 'iife',
                strict: false
            },
            plugins: [
                require("../plugins/rollup-plugin-switch-renderer.js")({ context: 'client' }),
                postcss({
                    ignore: true
                }),
                nodeResolve(),
                commonjs({ requireReturnsDefault: true }),
                multi({entryFileName: "bundle.legacy.js"}),
                strip(),
                babel({
                    configFile: path.resolve(__dirname, "babel", 'babel.config.client.legacy.js'),
                    babelHelpers: "bundled"
                }),
                copy({
                    sources: [ {
                        input: path.resolve(__dirname, "../..", "packages/client/libraries/**/*"),
                        output: path.resolve(settings.publicDirectory, "libraries")
                    }]
                }),
                production ? terser() : undefined
            ]
        }

    })
    .filter(bundle => bundle !== false);

module.exports = [
    ...legacyComponentBundles
]
