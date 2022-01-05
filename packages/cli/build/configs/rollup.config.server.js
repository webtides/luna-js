const path = require("path");

import commonjs from "@rollup/plugin-commonjs";
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const replace = require("@rollup/plugin-replace");

const {loadSettings} = require("@webtides/luna-js/src/framework/config");
const {generateBasePathsFromLunaConfig} = require("../plugins/helpers/entries");

export default async () => {
    const settings = await loadSettings();
    const {basePaths, files} = generateBasePathsFromLunaConfig(settings);

    const { resolveNodeModules } = settings.build.server;

    const production = process.env.NODE_ENV === "production";

    const bundle = {
        input: files,
        output: {
            dir: settings._generated.applicationDirectory,
            entryFileNames: '[name].js',
            sourcemap: production ? false : 'inline',
            format: 'cjs',
            exports: "auto"
        },
        plugins: [
            require("../plugins/rollup-plugin-strip-client-code")({
                basePaths,
            }),
            require("../plugins/rollup-plugin-postcss")({
                serverInclude: true,
                basePaths,
            }),
            require("../plugins/rollup-plugin-markdown")(),
            nodeResolve({
                resolveOnly: [ '@webtides/luna-js', ...resolveNodeModules ]
            }),
            replace({
                'process.env.CLIENT_BUNDLE': false,
                'process.env.SERVER_BUNDLE': true,
            }),
            babel({
                configFile: path.resolve(__dirname, "../..", 'babel.config.js'),
                babelHelpers: "bundled"
            }),
            json(),
            require("../plugins/rollup-plugin-manifest")({
                config: basePaths
            }),
            commonjs({
                requireReturnsDefault: true,
                transformMixedEsModules: true,
                ignoreGlobal: true,
            }),
        ]
    };

    return [bundle];
};
