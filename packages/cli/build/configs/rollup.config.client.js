const path = require("path");
const glob = require("glob-all");
const json = require('@rollup/plugin-json');
const {terser} = require("rollup-plugin-terser");
const {babel} = require('@rollup/plugin-babel');
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const replace = require("@rollup/plugin-replace");

const {getSettings} = require('@webtides/luna-js/lib/framework/config');

const production = process.env.NODE_ENV === "production";
const settings = getSettings();

const configBundle = {
    input: `@webtides/luna-js/src/client/functions/luna.js`,
    output: {
        dir: settings.publicDirectory
    },
    plugins: [
        nodeResolve(),
        babel({
            configFile: path.resolve(__dirname, "babel", 'babel.config.client.js'),
        }),
    ]
}

const styleBundles = settings.assets?.styles?.bundles?.map(bundle => {
    return {
        input: bundle.input,
        output: {
            dir: path.join(settings.publicDirectory, path.dirname(bundle.output)),
            entryFileNames: 'empty.js'
        },
        plugins: [
            require("../plugins/rollup-plugin-postcss")({
                publicDirectory: settings.publicDirectory,
                ...bundle
            })
        ]
    }
}) ?? [];

const componentBundles = (settings.components?.bundles?.flatMap(bundle => {
    const inputFiles = glob.sync([
        path.join(bundle.input, '**/*.js')
    ]);

    if (inputFiles.length === 0) {
        return false;
    }

    return [{
        preserveSymlinks: true,
        input: inputFiles,
        output: {
            dir: path.join(settings.publicDirectory, bundle.output),
            entryFileNames: production ? '[name]-[hash].js' : '[name].js',
            sourcemap: !production,
            format: 'es',
        },
        plugins: [
            require("../plugins/rollup-plugin-strip-server-code")(),require("../plugins/rollup-plugin-switch-renderer")({context: 'client'}),
            require("../plugins/rollup-plugin-client-manifest")({
                config: bundle
            }),
            require("../plugins/rollup-plugin-postcss")({
                publicDirectory: settings.publicDirectory,
                ...bundle.styles
            }),
            require("../plugins/rollup-plugin-markdown")(),
            json(),
            nodeResolve(),
            replace({
                    'process.env.CLIENT_BUNDLE': true}),
            babel({
                configFile: path.resolve(__dirname, "babel", 'babel.config.client.js'),
            }),
            commonjs({requireReturnsDefault: true}),
            require("../plugins/rollup-plugin-copy")({
                publicDirectory: settings.publicDirectory,
                sources: [
                    {input: path.resolve(__dirname, "../../", 'src/client/**/*'), output: 'assets/dev'},
                    ...(settings?.assets?.static?.sources ?? [])
                ]
            }),
            production ? terser() : undefined,
        ]
    }];
}) ?? [])
    .filter(bundle => !!bundle);

const bundles = [
    configBundle,
    ...styleBundles,
    ...componentBundles,
];

module.exports = bundles;
