const { getSettings } = require("@webtides/luna-js/src/framework/config");

const fs = require("fs");
const path = require("path");

const loadComponentChildren = contents => {
    const result = contents.match(/<(?:\w*-\w*)(?:-\w*)*/gm);

    return result
        ? result.filter(result => !!result && result.startsWith("<")).map(result => result.substring(1))
        : [];
};

const getRouteName = (name) => {
    name = name.replace(/\[(\w*)]/g, ":$1");

    if (name.endsWith("/index")) {
        return name.substring(0, name.length - "/index".length);
    }

    return name;
};

const isRouteWithParam = name => {
    const regex = new RegExp(/(:\w*)/);
    return regex.test(name);
};

const sortRoutes = (routes) => {
    return routes.sort((a, b) => {
        if (a.fallback && !b.fallback) {
            return 1;
        } else if (!a.fallback && b.fallback) {
            return -1;
        }

        if (isRouteWithParam(a.route) && !isRouteWithParam(b.route)) {
            return 1;
        } else if (isRouteWithParam(b.route) && !isRouteWithParam(a.route)) {
            return -1;
        }
        return 0;
    });
};

module.exports = function(options) {
    const { config } = options;
    const entries = {
        components: { },
        pages: { },
        apis: { },
        hooks: { },
    };

    const getEntryType = (id) => {
        let result = null;

        Object.keys(config).map(type => {
            config[type].forEach(configRow => {
                const { basePath } = configRow;

                if (path.resolve(id).startsWith(path.resolve(basePath))) {
                    result = {
                        type,
                        basePath: path.resolve(basePath),
                        settings: configRow.settings
                    }
                }
            })
        });

        return result;
    };

    const hasRegisteredEntry = id => {
        for (const type of Object.keys(entries)) {
            if (!!entries[type][id]) {
                return true;
            }
        }

        return false;
    };

    return {
        name: 'luna-manifest',
        resolveId(id, importer) {
            // A entry route.
            if (importer === undefined) {
                const moonSettings = getSettings();

                const entryType = getEntryType(id);

                if (entryType === null) {
                    return null;
                }

                const { type, basePath, settings } = entryType;

                const relativePath = id.substring(basePath.length);
                const relativeBasePath = basePath.substring(process.cwd().length);

                const entry = {
                    relativePath,
                    file: null,
                    settings,
                    basePath: relativeBasePath.split('\\').join('/')
                };

                if (type === 'apis' || type === 'pages') {
                    const fallbackRoute = moonSettings.pages?.fallback ?? false;
                    const fallbackApiRoute = moonSettings.api?.fallback ?? false;

                    const { context } = type === 'apis' ? moonSettings.api : moonSettings.pages;
                    let route = getRouteName(relativePath.split(".js")[0]);

                    if (type === 'apis' && route === fallbackApiRoute || type === 'pages' && route === fallbackRoute) {
                        entry.route = `${context ?? ''}/*`;
                        entry.fallback = true;
                    } else {
                        entry.route = `${context ?? ''}${route}`;
                    }
                }

                entries[type][path.resolve(id)] = entry;
            }

            return null;
        },

        async renderChunk(code, chunk, options) {
            if (chunk.facadeModuleId !== null && hasRegisteredEntry(path.resolve(chunk.facadeModuleId))) {
                const type = getEntryType(chunk.facadeModuleId).type;
                entries[type][path.resolve(chunk.facadeModuleId)].file = chunk.fileName;

                if (type === "components") {
                    entries[type][path.resolve(chunk.facadeModuleId)].children = loadComponentChildren(code);
                }
            }

            return null;
        },

        generateBundle() {
            const settings = getSettings();
            const { manifest } = settings._generated;

            const directory = path.dirname(manifest);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            const pagesManifest = { };

            Object.keys(entries).forEach(type => {
                pagesManifest[type] = Object.keys(entries[type]).map(key => entries[type][key]);
            });

            pagesManifest['pages'] = sortRoutes(pagesManifest['pages']);
            pagesManifest['apis'] = sortRoutes(pagesManifest['apis']);

            fs.writeFileSync(manifest, JSON.stringify(pagesManifest), { encoding: "utf-8" });
        },
    }
}
