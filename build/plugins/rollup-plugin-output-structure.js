const path = require("path");

module.exports = function ({directory, isPage = false}) {
    return {
        name: 'moon-output-structure',
        generateBundle(options, bundle, isWrite) {
            options.dir = path.join(options.dir, directory);
        }
    }
}
