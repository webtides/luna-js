const glob = require("glob-all");
const path = require("path");

const generateBasePathsFromLunaConfig = settings => {
    const basePaths = {
        pages: [],
        layouts: [],
        components: [],
        apis: [],
        hooks: []
    };

    const pages = settings.pages?.input?.flatMap(page => {
        basePaths.pages.push({
            basePath: page,
            settings: {
                factory: settings.pages.factory ?? false,
            }
        })
        return glob.sync(path.join(page, "**/*.js"));
    }) ?? [];

    const layouts = settings.layouts?.input?.flatMap(layout => {
        basePaths.layouts.push({
            basePath: layout,
        });
        return glob.sync(path.join(layout, "**/*.js"));
    })

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

    const components = settings.components?.bundles?.flatMap((componentBundle) => {
        basePaths.components.push({
            basePath: componentBundle.input,
            settings: {
                outputDirectory: componentBundle.output,
                defaultTarget: componentBundle.defaultTarget,
                factory: componentBundle.factory ?? false,
            },
        });
        return glob.sync(path.join(componentBundle.input, "**/*.js"))
    }) ?? [];

    const files = [...pages,...layouts, ...components, ...apis, ...hooks];

    return {
        files,
        basePaths
    }
};

const getEntryType = (id, basePaths) => {
    if (id === undefined) {
        return null;
    }

    let result = null;

    Object.keys(basePaths).forEach(type => {
        basePaths[type].forEach((row) => {
            const { basePath, settings } = row;

            if (path.resolve(id).startsWith(path.resolve(basePath))) {
                result = {
                    type,
                    basePath: path.resolve(basePath),
                    settings,
                }
            }
        })
    });

    return result;
};

module.exports = {
    getEntryType,
    generateBasePathsFromLunaConfig,
}
