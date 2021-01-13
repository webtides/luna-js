require("../../lib/packages/framework/bootstrap");

const path = require("path");
const glob = require("glob-all");
const {babel} = require('@rollup/plugin-babel');
const multi = require("@rollup/plugin-multi-entry");
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const copy = require("../plugins/rollup-plugin-copy");
const postcss = require('../plugins/rollup-plugin-postcss');
const strip = require("../plugins/rollup-plugin-strip-server-code");

const settings = require(path.join(process.cwd(), "moon.config.js"));

const styleSettings = settings.assets.styles;
const staticSettings = settings.assets.static;

const styleBundles = styleSettings.bundles.map(bundle => {
    return {
        input: bundle.input,
        output: {
            dir: bundle.outputDirectory,
            entryFileNames: 'empty.js'
        },
        plugins: [
            postcss({
                postcssPlugins: bundle.postcssPlugins || [ ],

                outputDirectory: bundle.outputDirectory,
                filename: bundle.filename
            })
        ]
    }
});

const moonBundle = {
    input: path.join(__dirname, "../..", `/packages/client/moon.js`),
    output: {
        dir: settings.publicDirectory,
        entryFileNames: '[name].js',
        sourcemap: true,
        format: 'iife'
    },
    plugins: [
        nodeResolve(),
        commonjs()
    ]
};

const componentBundles = settings.componentsDirectory
    .flatMap(bundle => {
        const inputFiles = glob.sync([
            path.join(bundle.basePath, bundle.directory, "**/*.js")
        ]);

        if (inputFiles.length === 0) {
            return false;
        }

        const pluginPostcss = postcss({
            ...bundle.styles
        });

        const bundles = [{
            input: inputFiles,
            output: {
                dir: bundle.outputDirectory,
                entryFileNames: '[name].js',
                sourcemap: true,
                format: 'es'
            },
            plugins: [
                pluginPostcss,
                nodeResolve(),
                babel({
                    configFile: path.resolve(__dirname, "babel", 'babel.config.client.js')
                }),
                strip(),
                commonjs(),
                copy({
                    sources: staticSettings.sources
                })
            ]
        }];

        if (settings.legacyBuild) {
            bundles.push({
                input: [ path.join(moon.currentDirectory, "packages/client/moon.js"), path.join(settings.buildDirectory, "generated/entry.legacy.js") ],
                output: {
                    dir: bundle.outputDirectory,
                    sourcemap: true,
                    entryFileNames: "bundle.legacy.js",
                    format: 'iife',
                    strict: false
                },
                plugins: [
                    nodeResolve(),
                    multi({entryFileName: "bundle.legacy.js"}),
                    strip(),
                    babel({
                        configFile: path.resolve(__dirname, "babel", 'babel.config.client.legacy.js'),
                        babelHelpers: "bundled"
                    }),
                    commonjs(),
                    pluginPostcss,
                ]
            });
        }

        return bundles;
    })
    .filter(bundle => bundle !== false);

const bundles = [
    moonBundle,
    ...styleBundles,
    ...componentBundles,
];

module.exports = bundles;
