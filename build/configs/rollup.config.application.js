const path = require("path");
const glob = require("glob-all");
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');
const postcss = require("../plugins/rollup-plugin-postcss");
const outputStructure = require("../plugins/rollup-plugin-output-structure");
const moonManifest = require("../plugins/rollup-plugin-manifest");
const clientBundles = require("./rollup.config.client");

const settings = require(path.join(process.cwd(), "moon.config.js"));

const {pagesDirectory, componentsDirectory, apisDirectory} = settings;

const basePaths = {
    pages: [],
    components: [],
    apis: []
};

const pages = pagesDirectory.flatMap(page => {
    basePaths.pages.push({
        basePath: page
    })
    return glob.sync(path.join(page, "**/*.js"));
});

const apis = apisDirectory.flatMap(api => {
    basePaths.apis.push({
        basePath: api
    });
    return glob.sync(path.join(api, "**/*.js"));
})

const components = componentsDirectory.flatMap(component => {
    basePaths.components.push({
        basePath: path.join(component.basePath, component.directory),
        settings: {
            outputDirectory: component.outputDirectory,
        }
    });
    return glob.sync(path.join(component.basePath, component.directory, "**/*.js"))
});

const files = [ ...pages, ...components, ...apis ];

const bundle = {
    input: files,
    output: {
        dir: path.join(settings.buildDirectory, "generated", "application"),
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

module.exports = [ bundle, ...clientBundles ];
