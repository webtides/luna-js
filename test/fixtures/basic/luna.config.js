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

    apisDirectory: [],
    hooksDirectory: [],

    assets: {
        styles: {
            bundles: []
        },
        static: {
            sources: []
        }
    }
}
