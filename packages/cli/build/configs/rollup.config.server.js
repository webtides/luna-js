const path = require("path");
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');
const del = require("rollup-plugin-delete");
const commonjs = require("@rollup/plugin-commonjs");
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const { getSettings } = require("@webtides/luna-js/lib/framework/config");
const {generateBasePathsFromLunaConfig} = require("../plugins/helpers/entries");

const settings = getSettings();
const { basePaths, files } = generateBasePathsFromLunaConfig(settings);

const production = process.env.NODE_ENV === "production";

const changeLitVersion = function () {
    return {
        name: 'luna-set-lit',
        resolveId(id, importer) {
            switch (id) {
                case 'luna-renderer':
                    return require.resolve('@webtides/luna-js/lib/renderer.js');
            }
        },
    }
};

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
        changeLitVersion(),
        require("../plugins/rollup-plugin-switch-renderer")({ context: 'server' }),

        babel({
            configFile: path.resolve(__dirname, "../..", 'babel.config.js'),
            babelHelpers: "bundled"
        }),
        commonjs({
            ignoreDynamicRequires: true
        }),
        json(),
        require("../plugins/rollup-plugin-manifest")({
            config: basePaths
        }),
        require("../plugins/rollup-plugin-postcss")({
            ignore: true
        }),
        require("../plugins/rollup-plugin-markdown")(),
        del({
            targets: [
                path.join(settings.publicDirectory, "*"),
                path.join(settings._generated.applicationDirectory, "*")
            ],
            runOnce: true
        })
    ]
};

module.exports = [ bundle ];
