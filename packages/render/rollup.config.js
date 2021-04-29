const settings = {
    buildDirectory: 'lib',
};

const bundle = {
    input: "index.js",
    output: {
        dir: settings.buildDirectory,
        entryFileNames: 'index.js',
        sourcemap: true,
        format: 'cjs'
    },
};

module.exports = [ bundle ];
