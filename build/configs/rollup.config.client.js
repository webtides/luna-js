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

const postcssPlugins = [

];

const styleBundles = styleSettings.bundles.map(bundle => {
    return {
        input: bundle.input,
        output: {
            dir: bundle.outputDirectory,
            entryFileNames: 'empty.js'
        },
        plugins: [
            postcss({
                postcssPlugins: bundle.postcssPlugins || [],

                outputDirectory: bundle.outputDirectory,
                filename: bundle.filename
            })
        ]
    }
});

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

        return [{
            preserveSymlinks: true,
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
                commonjs({ requireReturnsDefault: true }),
                babel({
                    configFile: path.resolve(__dirname, "babel", 'babel.config.client.js'),
                }),
                strip(),
                copy({
                    sources: staticSettings.sources
                }),
            ]
        }];
    })
    .filter(bundle => bundle !== false);

const bundles = [
    ...styleBundles,
    ...componentBundles,
];

module.exports = bundles;
