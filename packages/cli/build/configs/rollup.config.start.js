const path = require("path");
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');
const {nodeResolve} = require("@rollup/plugin-node-resolve");
const {loadSettings} = require("@webtides/luna-js/src/framework/config");


export default async () => {
    const settings = await loadSettings();

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
            nodeResolve({
                resolveOnly: ['@webtides/luna-js']
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
