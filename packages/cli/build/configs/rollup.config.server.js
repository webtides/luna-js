const path = require("path");
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const { getSettings } = require("@webtides/luna-js/lib/framework/config");
const {generateBasePathsFromLunaConfig} = require("../plugins/helpers/entries");

const settings = getSettings();
const { basePaths, files } = generateBasePathsFromLunaConfig(settings);

const production = process.env.NODE_ENV === "production";

if (!settings?._generated) {
    module.exports = [];
} else {
    const bundle = {
        input: files,
        output: {
            dir: settings._generated.applicationDirectory,
            entryFileNames: '[name].js',
            sourcemap: !production,
            format: 'cjs',
            exports: "auto"
        },
        plugins: [
            require("../plugins/rollup-plugin-switch-renderer")({context: 'server'}),
            nodeResolve({
            resolveOnly: [ '@webtides/luna-js' ]
        }),babel({
                configFile: path.resolve(__dirname, "../..", 'babel.config.js'),
                babelHelpers: "bundled"
            }),
            json(),
            require("../plugins/rollup-plugin-manifest")({
                config: basePaths
            }),
            require("../plugins/rollup-plugin-postcss")({
                ignore: true
            }),
            require("../plugins/rollup-plugin-markdown")(),

        ]
    };

    module.exports = [bundle];
}
