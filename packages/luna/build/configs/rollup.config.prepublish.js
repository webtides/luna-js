const path = require("path");

const {nodeResolve} = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const replace = require("@rollup/plugin-replace");
const {babel} = require('@rollup/plugin-babel');

const changeLitVersion = function () {
    return {
        name: 'luna-set-lit',
        resolveId(id, importer) {
            if (id === 'module') {
                return 'module';
            }

            if (importer && !importer.endsWith('luna-element.js')) {
                return;
            }

            switch (id) {
                case 'lit-html/experimental-hydrate.js':
                    return 'luna-lit-hydrate';
            }
        },

        load(id) {
            if (id === 'module') {
                return `
                    const createRequire = () => require;
                    export { createRequire };
                `;
            }

            if (id === 'luna-lit-hydrate') {
                return `
                    const hydrate = () => ({});
                    export { hydrate };
                `
            }
        },

        transform(code, id) {
            if (id === require.resolve('@webtides/element-js/src/StyledElement')) {
                return `
                    import {BaseElement} from '@webtides/element-js/src/BaseElement';
                    class StyledElement extends BaseElement { }
                    export { StyledElement }
                `;
            }
        }
    }
};

const settings = {
    buildDirectory: 'lib',
    frameworkBuildDirectory: 'lib/framework'
};

const clientBundle = {
    input: "index.js",
    output: {
        dir: settings.buildDirectory,
        entryFileNames: 'client.js',
        sourcemap: true,
        format: 'es'
    },
    plugins: [
        nodeResolve({
            preferBuiltins: true,
            dedupe: [ 'lit-html' ]
        }),
        babel({
            configFile: path.resolve(__dirname, "../..", 'babel.config.js')
        }),
        json()
    ]
};

const rendererBundle = {
    input: "server.js",
    output: {
        dir: settings.buildDirectory,
        entryFileNames: 'renderer.js',
        sourcemap: true,
        format: 'cjs'
    },
    plugins: [
        nodeResolve({
            preferBuiltins: true,
            dedupe: [ 'lit-html' ]
        }),
        babel({
            configFile: path.resolve(__dirname, "../..", 'babel.config.js')
        }),
        json()
    ]
};

const serverBundle = {
    input: "index.js",
    output: {
        dir: settings.buildDirectory,
        entryFileNames: 'server.js',
        sourcemap: true,
        format: 'cjs'
    },
    plugins: [
        changeLitVersion({ context: 'server' }),
        nodeResolve({
            // preferBuiltins: true,
            dedupe: [ 'lit-html' ],
            resolveOnly: [ '@webtides/element-js' ]
        }),
        babel({
            configFile: path.resolve(__dirname, "../..", 'babel.config.js')
        }),
        json()
    ]
};

module.exports = [ clientBundle, serverBundle, rendererBundle ];
