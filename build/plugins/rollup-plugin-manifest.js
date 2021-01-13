const { loadSettings } = require("../../lib/packages/framework/config");

const glob = require("glob");
const fs = require("fs");
const path = require("path");
const {proxy} = require("../../packages/cli/tasks/build/esm-proxy");

const loadComponentChildren = contents => {
    const regex = new RegExp(/<(?:\w*-\w*)(?:-\w*)*/gm);
    const result = regex.exec(contents);

    if (result) {
        return [ ...result ].filter(result => !!result && result.startsWith("<")).map(result => result.substring(1));
    }

    return [];
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
                const relativeBasePath = basePath.substring(process.cwd().length);

                entries[type][path.resolve(id)] = {
                    relativePath,
                    file: null,
                    settings,
                    basePath: relativeBasePath.split('\\').join('/')
                };
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
        },
    }
}
