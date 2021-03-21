const path = require("path");
const glob = require("glob-all");
const json = require('@rollup/plugin-json');
const {babel} = require('@rollup/plugin-babel');
const postcss = require("../plugins/rollup-plugin-postcss");
const moonManifest = require("../plugins/rollup-plugin-manifest");
const clientBundles = require("./rollup.config.client");
const del = require("rollup-plugin-delete");
const { getSettings } = require("@webtides/luna-js/lib/framework/config");

const settings = getSettings();

const basePaths = {
    pages: [],
    components: [],
    apis: [],
    hooks: []
};

const pages = settings.pages.input.flatMap(page => {
    basePaths.pages.push({
        basePath: page
    })
    return glob.sync(path.join(page, "**/*.js"));
});

const apis = settings.api.input.flatMap(api => {
    basePaths.apis.push({
        basePath: api
    });
    return glob.sync(path.join(api, "**/*.js"));
});

const hooks = settings.hooks.input.flatMap(hook => {
    basePaths.hooks.push({
        basePath: hook
    });
    return glob.sync(path.join(hook, "**/*.js"));
});

const components = settings.components.bundles.flatMap(component => {
    basePaths.components.push({
        basePath: component.input,
        settings: {
            outputDirectory: component.output,
        }
    });
    return glob.sync(path.join(component.input, "**/*.js"))
});

const files = [...pages, ...components, ...apis, ...hooks];

const production = process.env.NODE_ENV === "production";

const bundle = {
    input: files,
    output: {
        dir: settings._generated.applicationDirectory,
        entryFileNames: '[name].js',
        sourcemap: !production,
        format: 'cjs',
        exports: "auto"
    },
    external: [
        'glob', 'fs', 'path', 'buffer', 'stream'
    ],
    plugins: [
        require("../plugins/rollup-plugin-switch-renderer.js")({ context: 'server' }),
        babel({
            configFile: path.resolve(__dirname, "../..", 'babel.config.js'),
            babelHelpers: "bundled"
        }),
        json(),
        moonManifest({
            config: basePaths
        }),
        postcss({
            ignore: true
        }),
        require("../plugins/rollup-plugin-markdown.js")(),
        del({
            targets: [
                path.join(settings.publicDirectory, "*"),
                path.join(settings._generated.applicationDirectory, "*")
            ],
            runOnce: true
        })
    ]
};

module.exports = [bundle, ...clientBundles];
