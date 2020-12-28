import path from "path";
import glob from "glob-all";
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import multi from '@rollup/plugin-multi-entry';

const settings = require(path.join(process.cwd(), "moon.config.js"));

const componentsDirectory = path.join(process.cwd(), settings.componentsDirectory);

export default {
    input: path.join(__dirname, ".build/entry.legacy.js"),
    output: {
        dir: settings.assetsDirectory,
        sourcemap: true,
        format: 'iife'
    },
    plugins: [
        multi({ entryFileName: "bundle.legacy.js" }),
        postcss({ inject: false }),
        resolve(),
        babel({
            configFile: path.resolve(__dirname, 'babel.config.client.legacy.js')
        })
    ]
}
