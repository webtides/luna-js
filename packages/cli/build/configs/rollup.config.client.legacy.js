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

const { getSettings } = require('@webtides/luna-js/lib/framework/config');

const production = process.env.NODE_ENV === "production";
const settings = getSettings();

const legacyComponentBundles = settings.components.bundles
    .map(bundle => {
        return {
            input: [path.join(settings._generated.baseDirectory, "entry.legacy.js")],
            output: {
                dir: path.dirname(path.join(settings.publicDirectory, bundle.output)),
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
                        input: path.resolve(__dirname, "..", "libraries/**/*"),
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
