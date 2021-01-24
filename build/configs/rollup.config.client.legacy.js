require("../../lib/packages/framework/bootstrap");

const path = require("path");
const glob = require("glob-all");
const {babel} = require('@rollup/plugin-babel');
const multi = require("@rollup/plugin-multi-entry");
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const postcss = require('../plugins/rollup-plugin-postcss');
const strip = require("../plugins/rollup-plugin-strip-server-code");
const copy = require("../plugins/rollup-plugin-copy");

const settings = require(path.join(process.cwd(), "moon.config.js"));

const legacyComponentBundles = settings.componentsDirectory
    .map(bundle => {
        const inputFiles = glob.sync([
            path.join(bundle.basePath, bundle.directory, "**/*.js")
        ]);

        if (inputFiles.length === 0) {
            return false;
        }

        const pluginPostcss = postcss({
            ...bundle.styles,
            ignore: true
        });

        return {
            input: [path.join(settings.buildDirectory, "generated/entry.legacy.js")],
            output: {
                dir: bundle.outputDirectory,
                sourcemap: true,
                entryFileNames: "bundle.legacy.js",
                format: 'iife',
                strict: false
            },
            plugins: [
                pluginPostcss,
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
            ]
        }

    })
    .filter(bundle => bundle !== false);

module.exports = [
    ...legacyComponentBundles
]
