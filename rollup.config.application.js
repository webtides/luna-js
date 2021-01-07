import path from "path";

import glob from "glob-all";
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss'
import commonjs from "@rollup/plugin-commonjs";

const settings = require(path.join(process.cwd(), "moon.config.js"));

const components = settings.componentsDirectory
    .flatMap(bundle => {
        return glob.sync([
            path.join(bundle.basePath, "**/*.js")
        ]);
    });

export default {
    input: [ path.join(__dirname, "index.js"), path.join(__dirname, "lib/packages/framework/index.js"), ...components ],
    output: {
        dir: ".build/generated/bundle",
        entryFileNames: '[name].js',
        sourcemap: true,
        format: 'cjs',
    },
    plugins: [
        resolve({ }),
        commonjs(),
        babel({
            configFile: path.resolve(__dirname, 'babel.config.bundle.js')
        }),
        json(),
        postcss(),
    ]
}
