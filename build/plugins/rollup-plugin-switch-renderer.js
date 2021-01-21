const path = require("path");

module.exports = function () {
    return {
        name: 'moon-switch-renderer',
        resolveId(id) {
            if (id === "moon.js") {
                return "./node_modules/moon.js/lib/server.js";
            }
        }
    }
}
