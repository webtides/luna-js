import path from "path";
import fs from "fs";
import glob from "glob";
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';

const settings = require(path.join(process.cwd(), "moon.config.js"));

const scriptSettings = settings.assets.scripts.build;

const bundles = [
    settings.pagesDirectory,
    settings.componentsDirectory,
    settings.layoutsDirectory,
    settings.apiDirectory,
    settings.hooksDirectory
];

export default bundles.map(relativePath => {
    const input = path.join(relativePath, "**/*.js");

    const inputs = glob.sync(input);
    if (inputs.length === 0) {
        return false;
    }

    return {
        input: glob.sync(input),
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
