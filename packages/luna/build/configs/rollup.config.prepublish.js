const path = require("path");

const {nodeResolve} = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
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
                case 'lit-html':
                    return 'lit-html';
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

            if (id === 'lit-html') {
                return `
                    import { render as originalRender } from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
                    import { html } from "lit-html";
                    import { Readable } from 'stream';
                    
                    const streamToString = stream => {
                        const chunks = [];
                        return new Promise((resolve, reject) => {
                            stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                            stream.on('error', (err) => reject(err));
                            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
                        });
                    }
                    
                    const render = (template) => {
                        const stream = Readable.from(originalRender(template));
                        return streamToString(stream);
                    };

                    export { render, html };
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
        }),
        babel({
            configFile: path.resolve(__dirname, "../..", 'babel.config.js')
        }),
        json()
    ]
};

module.exports = [clientBundle, serverBundle];
