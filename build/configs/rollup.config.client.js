require("../../lib/packages/framework/bootstrap");

const path = require("path");
const glob = require("glob-all");
const { terser } = require("rollup-plugin-terser");
const {babel} = require('@rollup/plugin-babel');
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const copy = require("../plugins/rollup-plugin-copy");
const postcss = require('../plugins/rollup-plugin-postcss');
const strip = require("../plugins/rollup-plugin-strip-server-code");
const del = require("rollup-plugin-delete");

const production = process.env.NODE_ENV === "production";
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

        return [{
            preserveSymlinks: true,
            input: inputFiles,
            output: {
                dir: bundle.outputDirectory,
                entryFileNames: production ? '[name]-[hash].js' : '[name].js',
                sourcemap: !production,
                format: 'es'
            },
            plugins: [
                require("../plugins/rollup-plugin-client-manifest")({
                    config: bundle
                }),
                postcss({
                    ...bundle.styles
                }),
                nodeResolve(),
                commonjs({requireReturnsDefault: true}),
                babel({
                    configFile: path.resolve(__dirname, "babel", 'babel.config.client.js'),
                }),
                strip(),
                copy({
                    sources: staticSettings.sources
                }),
                production ? terser() : undefined,
                del({ targets: path.join(bundle.outputDirectory, "*.js") })
            ]
        }];
    })
    .filter(bundle => bundle !== false);

const bundles = [
    ...styleBundles,
    ...componentBundles,
];

module.exports = bundles;
