const path = require("path");
const glob = require("glob-all");
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');
const postcss = require("../plugins/rollup-plugin-postcss");
const outputStructure = require("../plugins/rollup-plugin-output-structure");

const settings = require(path.join(process.cwd(), "moon.config.js"));

const pagesBundles = settings.pagesDirectory.flatMap(page => {
    const directory = path.join(page.basePath, page.directory, "**/*.js")
    const files = glob.sync(directory);

    return files.map(file => {
        const relativePath = path.dirname(file).substring(path.join(page.basePath, page.directory).length);

        return {
            input: file,
            output: {
                dir: path.join(settings.buildDirectory, "generated", "pages", relativePath),
                entryFileNames: '[name].js',
                sourcemap: true,
                format: 'cjs',
                exports: "auto"
            },
            external: [
                'glob', 'fs', 'path'
            ],
            plugins: [
                babel({
                    configFile: path.resolve(__dirname, "../..", 'babel.config.js'),
                    babelHelpers: "bundled"
                }),
                json(),
            ]
        }
    });
})

const componentsBundles = settings.componentsDirectory.map(component => {
    const directory = path.join(component.basePath, component.directory, "**/*.js")
    const files = glob.sync(directory);

    return {
        input: files,
        output: {
            dir: path.join(settings.buildDirectory, "generated", "components"),
            entryFileNames: '[name].js',
            sourcemap: true,
            format: 'cjs',
            exports: "default"
        },
        external: [
            'glob', 'fs', 'path'
        ],
        plugins: [
            babel({
                configFile: path.resolve(__dirname, "../..", 'babel.config.js'),
                babelHelpers: "bundled"
            }),
            json(),
            postcss({
                serverBuild: true,
                ...component.styles
            }),
            outputStructure({
                directory: component.directory
            })
        ]
    }

});


module.exports = [
    ...componentsBundles,
    ...pagesBundles
]
