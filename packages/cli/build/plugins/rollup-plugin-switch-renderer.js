const path = require('path');

const importsToResolve = [
    '@webtides/luna-js/src/renderer',
    '@webtides/luna-js/src/renderer/index.js'
];

module.exports = function ({ context = 'server' } = {}) {
    return {
        name: 'luna-switch-renderer',
        resolveId(id) {
            if (importsToResolve.includes(id)) {
                switch (context) {
                    case 'client':
                        return path.resolve(process.cwd(), 'node_modules', '@webtides/luna-js/src/renderer/lit/client.js');
                    default:
                        return path.resolve(process.cwd(), 'node_modules', '@webtides/luna-js/src/renderer/lit/server.js');
                }
            }
        }
    }
}
