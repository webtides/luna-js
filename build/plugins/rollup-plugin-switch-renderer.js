const path = require("path");

module.exports = function () {
    return {
        name: 'moon-switch-renderer',
        resolveId(id) {
            if (id === "@webtides/moon-js") {
                return path.resolve(__dirname, "../..", "lib/server.js");
            }
        }
    }
}
