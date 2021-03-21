const { getSettings } = require("@webtides/luna-js/lib/framework/config");

const fs = require("fs");
const path = require("path");

const loadComponentChildren = contents => {
    const result = contents.match(/<(?:\w*-\w*)(?:-\w*)*/gm);

    return result
        ? result.filter(result => !!result && result.startsWith("<")).map(result => result.substring(1))
        : [];
};

module.exports = function(options) {
    const { config } = options;
    const entries = {
        components: { },
        pages: { },
        apis: { },
        hooks: { }
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

                entries[type][path.resolve(id)] = {
                    relativePath,
                    file: null,
                    settings,
                    basePath: relativeBasePath.split('\\').join('/')
                };

                if (type === 'apis') {
                    const { context } = moonSettings.api;
                    const apiRoute = relativePath.split(".js")[0];

                    entries[type][path.resolve(id)].route = `${context}${apiRoute}`;
                }
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
            })

            fs.writeFileSync(manifest, JSON.stringify(pagesManifest), { encoding: "utf-8" });
        },
    }
}
