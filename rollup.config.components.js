import path from "path";
import fs from "fs";

import glob from "glob-all";
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';

const settings = require(path.join(process.cwd(), "moon.config.js"));

export default {
    input: glob.sync([ settings.pagesDirectory, settings.componentsDirectory ]),
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
