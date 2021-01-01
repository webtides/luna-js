import path from "path";
import glob from "glob-all";
import babel from '@rollup/plugin-babel';
import multi from "@rollup/plugin-multi-entry";
import resolve from "rollup-plugin-node-resolve";
import copy from "rollup-plugin-copy";

const settings = require(path.join(process.cwd(), "moon.config.js"));

const styleSettings = settings.assets.styles.build;
const scriptSettings = settings.assets.scripts.build;
const staticSettings = settings.assets.static;

const scriptInputs = [ scriptSettings.input ].flat();

const bundles = [
    {
        input: styleSettings.input,
        output: {
            dir: settings.assets.buildDirectory,
            entryFileNames: 'empty.js'
        },
        plugins: [
            ...styleSettings.plugins
        ]
    },

    {
        input: glob.sync([
            `${__dirname}/packages/client/moon.js`,
            path.join(settings.componentsDirectory, "**/*.js"),
            ...scriptInputs
        ]),
        output: {
            dir: settings.assets.buildDirectory,
            entryFileNames: '[name].js',
            sourcemap: true,
            format: 'es'
        },
        plugins: [
            resolve(),
            ...scriptSettings.plugins,
            babel({
                configFile: path.resolve(__dirname, 'babel.config.client.js')
            }),
            copy({
                flatten: staticSettings.flatten || false,
                targets: staticSettings.sources.map(source => {
                    return {
                        src: source.input,
                        dest: path.join(settings.publicDirectory, source.output)
                    }
                })
            })
        ]
    }
];

if (settings.legacyBuild) {
    bundles.push({
        input: path.join(__dirname, "lib/entry.legacy.js"),
        output: {
            dir: settings.assets.buildDirectory,
            sourcemap: true,
            format: 'iife'
        },
        plugins: [
            multi({ entryFileName: "bundle.legacy.js" }),
            resolve(),
            ...scriptSettings.plugins,
            babel({
                configFile: path.resolve(__dirname, 'babel.config.client.legacy.js')
            })
        ]
    });
}


export default bundles;
