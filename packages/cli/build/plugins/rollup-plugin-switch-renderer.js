const path = require('path');

const importsToResolve = [
    '@webtides/luna-renderer',
    '@webtides/luna-renderer/lit'
];

module.exports = function ({ context = 'server' } = {}) {
    return {
        name: 'luna-switch-renderer',
        resolveId(id) {
            if (importsToResolve.includes(id)) {
                switch (context) {
                    case 'client':
                        return path.resolve(process.cwd(), 'node_modules', '@webtides/luna-renderer/lit/client/index.js');
                    default:
                        return path.resolve(process.cwd(), 'node_modules', '@webtides/luna-renderer/lit/server/index.js');
                }
            }
        }
    }
}
