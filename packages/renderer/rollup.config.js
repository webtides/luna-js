const {nodeResolve} = require('@rollup/plugin-node-resolve');

function metaImportUrl() {
    return {
        name: 'luna-meta-import-url',
        resolveImportMeta(prop, {moduleId}) {
            return `new (require('u' + 'rl').URL)('file:' + __filename).href`;
        }
    }
}

const clientBundle = {
    input: "client.js",
    output: {
        dir: 'lib',
        entryFileNames: 'client.js',
        sourcemap: true,
        format: 'es'
    },
    plugins: [
        nodeResolve({
            preferBuiltins: true,
            dedupe: [ 'lit-html' ]
        }),
    ]
};

const bundle = {
    input: "server.js",
    output: {
        dir: 'lib',
        entryFileNames: 'server.js',
        sourcemap: true,
        format: 'cjs'
    },
    plugins: [
        metaImportUrl(),
        nodeResolve({
            preferBuiltins: true,
            dedupe: [ 'lit-html' ]
        }),
    ]
};

module.exports = [ clientBundle, bundle ];
