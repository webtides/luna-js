const path = require("path");
const glob = require("glob-all");
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');
const postcss = require("../plugins/rollup-plugin-postcss");
const moonManifest = require("../plugins/rollup-plugin-manifest");
const clientBundles = require("./rollup.config.client");
const del = require("rollup-plugin-delete");

const settings = require(path.join(process.cwd(), "moon.config.js"));

const {pagesDirectory, componentsDirectory, apisDirectory, hooksDirectory} = settings;

const basePaths = {
    pages: [],
    components: [],
    apis: [],
    hooks: []
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
});

const hooks = hooksDirectory.flatMap(hook => {
    basePaths.hooks.push({
        basePath: hook
    });
    return glob.sync(path.join(hook, "**/*.js"));
});

const components = componentsDirectory.flatMap(component => {
    basePaths.components.push({
        basePath: path.join(component.basePath, component.directory),
        directory: component.directory,
        settings: {
            outputDirectory: component.outputDirectory,
        }
    });
    return glob.sync(path.join(component.basePath, component.directory, "**/*.js"))
});

const files = [...pages, ...components, ...apis, ...hooks];

const production = process.env.NODE_ENV === "production";

const bundle = {
    input: files,
    output: {
        dir: path.join(settings.buildDirectory, "generated", "application"),
        entryFileNames: '[name].js',
        sourcemap: !production,
        format: 'cjs',
        exports: "auto"
    },
    external: [
        'glob', 'fs', 'path'
    ],
    plugins: [
        require("../plugins/rollup-plugin-switch-renderer.js")(),
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
        }),
        require("../plugins/rollup-plugin-markdown.js")(),
        del({
            targets: [
                path.join(settings.buildDirectory, "generated/public/assets", "*"),
                path.join(settings.buildDirectory, "generated/application", "*")
            ],
            runOnce: true
        })
    ]
};

module.exports = [bundle, ...clientBundles];
