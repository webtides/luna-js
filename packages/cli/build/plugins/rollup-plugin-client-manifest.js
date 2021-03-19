const { loadSettings } = require("@webtides/luna-js/lib/framework/config");

const fs = require("fs");
const path = require("path");

module.exports = function(options) {
    const { config } = options;
    const entries = {};

    const hasRegisteredEntry = id => {
        return !!entries[id];
    };

    return {
        name: 'luna-frontend-manifest',
        resolveId(id, importer) {
            // A entry route.
            if (importer === undefined) {
                const { basePath } = config;
                const relativePath = id.substring(basePath.length);

                entries[path.resolve(id)] = {
                    relativePath,
                    file: null,
                };
            }

            return null;
        },

        async renderChunk(code, chunk, options) {
            if (chunk.facadeModuleId !== null && hasRegisteredEntry(path.resolve(chunk.facadeModuleId))) {
                entries[path.resolve(chunk.facadeModuleId)].file = chunk.fileName;
            }

            return null;
        },

        async generateBundle() {
            const settings = await loadSettings();
            const { clientManifest } = settings._generated;

            let manifest = { };

            const directory = path.dirname(clientManifest);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            } else if (fs.existsSync(clientManifest)) {
                manifest = JSON.parse(fs.readFileSync(clientManifest, { encoding: "utf-8" }));
            }

            Object.keys(entries).forEach(id => {
                manifest[entries[id].relativePath] = entries[id].file;
            })

            fs.writeFileSync(clientManifest, JSON.stringify(manifest), { encoding: "utf-8" });
        },
    }
}
