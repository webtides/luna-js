const path = require("path");
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const {loadSettings} = require("@webtides/luna-js/src/framework/config");
const {generateBasePathsFromLunaConfig} = require("../plugins/helpers/entries");


export default async () => {
    const settings = await loadSettings();
    const {basePaths, files} = generateBasePathsFromLunaConfig(settings);

    const production = process.env.NODE_ENV === "production";

    const bundle = {
        input: '@webtides/luna-js/start.js',
        output: {
            dir: settings._generated.baseDirectory,
            entryFileNames: 'start.js',
            sourcemap: !production,
            format: 'cjs',
        },
        plugins: [
            require("../plugins/rollup-plugin-postcss")({
                ignore: true
            }),
            require("../plugins/rollup-plugin-switch-renderer")({ context: 'server'}),
            nodeResolve({
                resolveOnly: ['@webtides/luna-js',  '@webtides/element-js' ]
            }),
            babel({
                configFile: path.resolve(__dirname, "../..", 'babel.config.js'),
                babelHelpers: "bundled"
            }),
            json(),
        ]
    };

    return [ bundle ];
};
