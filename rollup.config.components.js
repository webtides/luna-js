import path from "path";
import fs from "fs";
import glob from "glob-all";
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';

const settings = require(path.join(process.cwd(), "moon.config.js"));

const scriptSettings = settings.assets.scripts.build;

export default {
    input: glob.sync([ settings.pagesDirectory, settings.componentsDirectory, settings.layoutsDirectory, settings.apiDirectory ]),
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
        ...scriptSettings.plugins,
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
