const glob = require("glob-all");
const path = require("path");

const generateBasePathsFromLunaConfig = settings => {
    const basePaths = {
        pages: [],
        components: [],
        apis: [],
        hooks: []
    };

    const pages = settings.pages?.input?.flatMap(page => {
        basePaths.pages.push({
            basePath: page
        })
        return glob.sync(path.join(page, "**/*.js"));
    }) ?? [];

    const apis = settings.api?.input?.flatMap(api => {
        basePaths.apis.push({
            basePath: api
        });
        return glob.sync(path.join(api, "**/*.js"));
    }) ?? [];

    const hooks = settings.hooks?.input?.flatMap(hook => {
        basePaths.hooks.push({
            basePath: hook
        });
        return glob.sync(path.join(hook, "**/*.js"));
    }) ?? [];

    const components = settings.components?.bundles?.flatMap(component => {
        basePaths.components.push({
            basePath: component.input,
            settings: {
                outputDirectory: component.output,
            }
        });
        return glob.sync(path.join(component.input, "**/*.js"))
    }) ?? [];

    const files = [...pages, ...components, ...apis, ...hooks];

    return {
        files,
        basePaths
    }
};

module.exports = {
    generateBasePathsFromLunaConfig,
}
