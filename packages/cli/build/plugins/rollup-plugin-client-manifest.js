const { getSettings } = require("@webtides/luna-js/src/framework/config");

const fs = require("fs");
const path = require("path");

module.exports = function(options) {
    const entries = {};

    const hasRegisteredEntry = id => {
        return !!entries[id];
    };

    return {
        name: 'luna-frontend-manifest',
        resolveId(id, importer) {
            // A entry route.
            if (importer === undefined) {
                entries[path.resolve(id)] = {
                    relativePath: path.dirname(id).substring(options.config.input.length),
                    filename: path.basename(id),
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

        generateBundle() {
            const settings = getSettings();
            const { clientManifest } = settings._generated;

            let manifest = { };

            const directory = path.dirname(clientManifest);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            } else if (fs.existsSync(clientManifest)) {
                manifest = JSON.parse(fs.readFileSync(clientManifest, 'utf-8'));
            }

            Object.keys(entries).forEach(id => {
                manifest[entries[id].relativePath + "/" + entries[id].filename] = entries[id].file;
            });

            fs.writeFileSync(clientManifest, JSON.stringify(manifest), 'utf-8');
        },
    }
}
