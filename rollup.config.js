import path from "path";

import glob from "glob-all";
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

const settings = {
    buildDirectory: '.build',
    assetsDirectory: '.build/public/assets'
};

export default {
    input: glob.sync(['packages/client/previous.js', 'app/views/components/**/*.js']),
    output: {
        dir: settings.assetsDirectory,
        entryFileNames: '[name].js',
        sourcemap: true,
        preserveModules: true,
        format: 'es'
    },
    plugins: [
        postcss({ inject: false }),
        resolve(),
        babel({
            configFile: path.resolve(__dirname, 'babel.config.client.js')
        })
    ]
}
