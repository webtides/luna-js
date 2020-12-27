import path from "path";

import glob from "glob-all";
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

const settings = require(path.join(process.cwd(), "moon.config.js"));

export default {
    input: glob.sync([`${__dirname}/packages/client/previous.js`, settings.pagesDirectory, settings.componentsDirectory ]),
    output: {
        dir: settings.assetsDirectory,
        entryFileNames: '[name].js',
        sourcemap: true,
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
