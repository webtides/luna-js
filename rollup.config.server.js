import path from "path";

import glob from "glob-all";
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import commonjs from "@rollup/plugin-commonjs";

const settings = {
    buildDirectory: '.build',
    assetsDirectory: '.build/packages'
};

export default {
    input: glob.sync(['packages/**/*.js', 'app/views/**/*.js']),
    output: {
        dir: settings.buildDirectory,
        entryFileNames: '[name].js',
        sourcemap: true,
        preserveModules: true,
        format: 'cjs'
    },
    external: [
        'glob', 'fs'
    ],
    plugins: [
        postcss({ inject: false, extract: false }),
        resolve({
            preferBuiltins: true,
            only: [ '@webtides/element-js' ]
        }),
        babel({
            configFile: path.resolve(__dirname, 'babel.config.js')
        }),
        json(),
    ]
}
