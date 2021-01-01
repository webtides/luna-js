import path from "path";
import fs from "fs";
import glob from "glob";
import globAll from "glob-all";
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import rename from 'rollup-plugin-rename';

const settings = require(path.join(process.cwd(), "moon.config.js"));

const scriptSettings = settings.assets.scripts.build;

const bundles = [
    settings.apiDirectory,
];

export default bundles.map(relativePath => {
    const input = path.join(relativePath, "**/*.js");

    const inputs = glob.sync(input);
    if (inputs.length === 0) {
        return false;
    }

    return {
        input: globAll.sync([ input ]),
        output: {
            dir: path.join(settings.buildDirectory, relativePath),
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
                only: ['@webtides/element-js']
            }),
            babel({
                configFile: path.resolve(__dirname, 'babel.config.js')
            }),
            json()
        ]
    }
}).filter(config => !!config);
