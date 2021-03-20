const path = require("path");

module.exports = {
    buildDirectory: ".build",
    publicDirectory: ".build/public",

    pagesDirectory: [ path.join(__dirname, "views/pages") ],

    port: 3010,

    componentsDirectory: [
        {
            basePath: path.join(__dirname, "views"),
            directory: "components",
            outputDirectory: ".build/public/assets",

            styles: {
                outputDirectory: ".build/public/assets/css",
                filename: "base.css",
            }
        }
    ],

    apisDirectory: [ path.join(__dirname, "api") ],
    hooksDirectory: [ path.join(__dirname, "hooks") ],

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
