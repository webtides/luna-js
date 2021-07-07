const path = require("path");
const { terser } = require("rollup-plugin-terser");
const {babel} = require('@rollup/plugin-babel');
const multi = require("@rollup/plugin-multi-entry");
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const postcss = require('../plugins/rollup-plugin-postcss');
const copy = require("../plugins/rollup-plugin-copy");
const replace = require("@rollup/plugin-replace");
const json = require('@rollup/plugin-json');

const { getSettings } = require('@webtides/luna-js/src/framework/config');

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
                postcss({
                    ignore: true
                }),
                require("../plugins/rollup-plugin-markdown")(),
                require("../plugins/rollup-plugin-strip-server-code")(),
                json(),
                nodeResolve(),
                replace({
                    'process.env.CLIENT_BUNDLE': true,
                    'process.env.SERVER_BUNDLE': false,
                }),
                babel({
                    configFile: path.resolve(__dirname, "babel", 'babel.config.client.legacy.js'),
                    babelHelpers: "bundled"
                }),
                multi({entryFileName: "bundle.legacy.js"}),
                copy({
                    publicDirectory: settings.publicDirectory,
                    sources: [ {
                        input: path.resolve(__dirname, "..", "libraries/**/*"),
                        output: 'libraries'
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
