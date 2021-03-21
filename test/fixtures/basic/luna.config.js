const path = require("path");

module.exports = {
    port: 3010,

    build: {
        output: '.build'
    },

    pages: {
        input: [path.join(__dirname, "views/pages")]
    },

    components: {
        bundles: [{
            input: path.join(__dirname, "views/components"),
            output: "assets",

            styles: {
                output: "assets/css/base.css",
            }
        }]
    },

    api: {
        input: [path.join(__dirname, "api")],
    },

    hooks: {
        input: [path.join(__dirname, "hooks")],
    },

    routes: {
        cacheable: [
            /cache/
        ]
    },

    assets: {
        styles: {
            bundles: []
        },
        static: {
            sources: []
        }
    }
}
