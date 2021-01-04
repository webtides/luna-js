import path from "path";
import glob from "glob-all";
import babel from '@rollup/plugin-babel';
import multi from "@rollup/plugin-multi-entry";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "./build/plugins/rollup-plugin-copy";
import {postcssPlugins} from "./packages/client/styles/postcss-loader";
import postcss from 'rollup-plugin-postcss'

const settings = require(path.join(process.cwd(), "moon.config.js"));

const styleSettings = settings.assets.styles;
const staticSettings = settings.assets.static;

const styleBundles = styleSettings.bundles.map(bundle => {
    return {
        input: glob.sync(bundle.input),
        output: {
            dir: bundle.outputDirectory,
            entryFileNames: 'empty.js'
        },
        plugins: [
            postcss({
                inject: false,
                extract: bundle.filename,
                plugins: [
                    ...postcssPlugins,
                    ...bundle.postcssPlugins
                ],
                extension: [".css"]
            })
        ]
    }
});

const componentBundles = settings.componentsDirectory.flatMap(bundle => {
    const pluginPostcss = postcss({
        inject: false,
        extract: false,
        plugins: [
            ...postcssPlugins
        ],
        extension: [".css"]
    });

    const bundles = [{
        input: glob.sync([
            `${__dirname}/packages/client/moon.js`,
            path.join(bundle.basePath, "**/*.js")
        ]),
        output: {
            dir: bundle.outputDirectory,
            entryFileNames: '[name].js',
            sourcemap: true,
            format: 'es'
        },
        plugins: [
            resolve(),
            commonjs(),
            pluginPostcss,
            babel({
                configFile: path.resolve(__dirname, 'babel.config.client.js')
            }),
            copy({
                sources: staticSettings.sources
            })
        ]
    }];

    if (settings.legacyBuild) {
        bundles.push({
            input: path.join(__dirname, "lib/entry.legacy.js"),
            output: {
                dir: bundle.outputDirectory,
                sourcemap: true,
                format: 'iife'
            },
            plugins: [
                multi({entryFileName: "bundle.legacy.js"}),
                resolve(),
                commonjs(),
                pluginPostcss,
                babel({
                    configFile: path.resolve(__dirname, 'babel.config.client.legacy.js')
                })
            ]
        });
    }

    return bundles;
});

const bundles = [
    ...styleBundles,
    ...componentBundles,
];

export default bundles;
