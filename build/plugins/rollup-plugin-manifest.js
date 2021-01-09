const { loadSettings } = require("../../lib/packages/framework/config");

const glob = require("glob");
const fs = require("fs");
const path = require("path");

const getComponentSettingsFromId = (id) => {
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
        name: 'moon-manifest',
        resolveId(id, importer) {
            // A entry route.
            if (importer === undefined) {
                const entryType = getEntryType(id);

                if (entryType === null) {
                    return null;
                }

                const { type, basePath, settings } = entryType;

                const relativePath = id.substring(basePath.length);

                entries[type][path.resolve(id)] = {
                    relativePath,
                    file: null,
                    settings
                };
            }

            return null;
        },

        async renderChunk(code, chunk, options) {
            if (chunk.facadeModuleId !== null && hasRegisteredEntry(path.resolve(chunk.facadeModuleId))) {
                entries[getEntryType(chunk.facadeModuleId).type][path.resolve(chunk.facadeModuleId)].file = chunk.fileName;
            }

            return null;
        },

        async generateBundle() {
            const settings = await loadSettings();
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
        }
    }
}
