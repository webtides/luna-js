import path from "path";

import glob from "glob-all";
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';

const settings = {
    buildDirectory: 'lib',
};

export default {
    input: "index.js",
    output: {
        dir: settings.buildDirectory,
        entryFileNames: '[name].js',
        sourcemap: true,
        format: 'cjs'
    },
    external: [
        'glob', 'fs', 'path'
    ],
    plugins: [
        resolve({
            preferBuiltins: true,
            only: [ '@webtides/element-js' ]
        }),
        babel({
            configFile: path.resolve(__dirname, 'babel.config.js')
        }),
        json()
    ]
}
