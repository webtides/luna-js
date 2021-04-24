const path = require("path");

const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');

const settings = {
    buildDirectory: 'lib'
};

const setLunaRenderer = function () {
    return {
        name: 'luna-set-renderer',
        resolveId(id, importer) {
            if (id === 'luna-renderer') {
                return '@webtides/luna-js/lib/renderer.js';
            }
        }
    }
};

const bundle = {
    input: "src/index.js",
    output: {
        dir: settings.buildDirectory,
        entryFileNames: 'index.js',
        sourcemap: true,
        format: 'cjs'
    },
    plugins: [
        setLunaRenderer(),
        babel({
            configFile: path.resolve(__dirname, 'babel.config.js')
        }),
        json()
    ]
};

module.exports = [ bundle ];
