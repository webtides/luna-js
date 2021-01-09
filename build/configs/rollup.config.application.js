const path = require("path");
const glob = require("glob-all");
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');
const postcss = require("../plugins/rollup-plugin-postcss");
const outputStructure = require("../plugins/rollup-plugin-output-structure");
const moonManifest = require("../plugins/rollup-plugin-manifest");

const settings = require(path.join(process.cwd(), "moon.config.js"));

const {pagesDirectory, componentsDirectory} = settings;

const basePaths = {
    pages: [ ],
    components: []
};

const pages = pagesDirectory.flatMap(page => {
    basePaths.pages.push({
        basePath: path.join(page.basePath, page.directory)
    })
    return glob.sync(path.join(page.basePath, page.directory, "**/*.js"));
});

const components = componentsDirectory.flatMap(component => {
    basePaths.components.push({
        basePath: path.join(component.basePath, component.directory),
        settings: {
            outputDirectory: component.outputDirectory,
        }
    });
    return glob.sync(path.join(component.basePath, component.directory, "**/*.js"))
});

console.log(basePaths);

const files = [ ...pages, ...components];

const bundle = {
    input: files,
    output: {
        dir: path.join(settings.buildDirectory, "generated", "pages"),
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
        moonManifest({
            config: basePaths
        }),
        postcss({
            basePaths,
            ignore: true
        })
    ]
};

module.exports = bundle;
