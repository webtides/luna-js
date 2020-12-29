import path from "path";
import glob from "glob-all";
import babel from '@rollup/plugin-babel';
import {pluginPostcss, plugins} from "./rollup.config.base";

const settings = require(path.join(process.cwd(), "moon.config.js"));

export default [
    {
        input: `${__dirname}/packages/client/styles/base.css`,
        output: {
            dir: settings.assets.buildDirectory,
            entryFileNames: 'empty.js'
        },
        plugins: [
            pluginPostcss({ extract: settings.assets.baseCss })
        ]
    },
    {
        input: glob.sync([`${__dirname}/packages/client/moon.js`, `${__dirname}/packages/client/styles/components.css`, settings.pagesDirectory, settings.componentsDirectory]),
        output: {
            dir: settings.assets.buildDirectory,
            entryFileNames: '[name].js',
            sourcemap: true,
            format: 'es'
        },
        plugins: [
            ...plugins(),
            babel({
                configFile: path.resolve(__dirname, 'babel.config.client.js')
            })
        ]
    }
]
