import path from "path";

import commonjs from "@rollup/plugin-commonjs";
import {nodeResolve} from "@rollup/plugin-node-resolve";

import copy from "rollup-plugin-copy";

import dynamicRequire from './build/rollup-plugin-dynamic-require';

const bundles = [
    { name: 'element-js' },
    { name: 'lit', resolve: [ /@lit.*/, /lit.*/, 'lit-html' ] }
];



export default bundles.map(bundle => ({
        input: `./src/${bundle.name}/index.js`,
        output: {
            file: `./lib/${bundle.name}/index.js`,
            format: 'cjs',
            exports: "auto",
            inlineDynamicImports: true,
        },
        plugins: [
            dynamicRequire(),
            nodeResolve({
                resolveOnly: bundle.resolve ?? [],
            }),
            commonjs({
                requireReturnsDefault: true,
                transformMixedEsModules: true,
            }),
            copy({
                targets: [
                    { src: `./src/${bundle.name}/stubs`, dest: `./lib/${bundle.name}`}
                ]
            })
        ],
    }));
