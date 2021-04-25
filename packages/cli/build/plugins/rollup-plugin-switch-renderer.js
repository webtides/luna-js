const path = require("path");

module.exports = function ({ context = 'server' } = {}) {
    return {
        name: 'luna-switch-renderer',
        resolveId(id) {
            if (id === "@webtides/luna-js") {
                switch (context) {
                    case 'client':
                        return path.resolve(process.cwd(), "node_modules/@webtides/luna-js", "lib/client.js");
                    default:
                        return path.resolve(process.cwd(), "node_modules/@webtides/luna-js", "lib/server.js");
                }
            }

            if (id === '@webtides/luna-renderer') {
                switch (context) {
                    case 'client':
                        return path.resolve(process.cwd(), "node_modules/@webtides/luna-renderer", "lib/client.js");
                    default:
                        return path.resolve(process.cwd(), "node_modules/@webtides/luna-renderer", "lib/server.js");
                }
            }
        }
    }
}
