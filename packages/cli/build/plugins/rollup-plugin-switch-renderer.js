const path = require("path");

module.exports = function ({ context = 'server' } = {}) {
    return {
        name: 'luna-switch-renderer',
        resolveId(id, importer) {
            if (id === "@webtides/luna-js") {
                switch (context) {
                    case 'client':
                        return require.resolve("@webtides/luna-js/lib/client.js");
                    default:
                        return require.resolve("@webtides/luna-js/lib/server.js");
                }
            }
        }
    }
}
