const path = require('path');

const importsToResolve = [
    'lit-html',
    'lit-html/directives/unsafe-html',
    'lit-html/directives/unsafe-html.js',
    'lit-html/lib/shady-render',
    'lit-html/lib/shady-render.js'
];

module.exports = function ({ context = 'server' } = {}) {
    return {
        name: 'luna-switch-renderer',
        resolveId(id) {
            if (importsToResolve.includes(id)) {
                switch (context) {
                    case 'server':
                        return path.resolve(process.cwd(), 'node_modules', '@webtides/luna-js/render.js');
                }
            }
        }
    }
}
