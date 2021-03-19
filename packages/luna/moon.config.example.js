const path = require("path");

module.exports = {
    buildDirectory: ".build",
    publicDirectory: ".build/public",

    pagesDirectory: [ path.join(__dirname, "pages") ],

    componentsDirectory: [
        {
            basePath: path.join(__dirname),
            directory: "components",
            outputDirectory: ".build/public/assets",

            styles: {
                outputDirectory: ".build/public/assets/css",
                filename: "base.css",
                postcssPlugins: [ ]
            }
        }
    ],

    hooksDirectory: [ path.join(__dirname, "hooks") ],
    apisDirectory: [ path.join(__dirname, "api") ],

    legacyBuild: false,

    fallbackRoute: "/fallback",
    fallbackApiRoute: "/fallback",

    assets: {
        buildDirectory: ".build/public/assets",
        context: '',

        styles: {
            bundles: [ ]
        },

        static: {
            sources: []
        }
    },

    export: {
        outputDirectory: ".export",
        apiOutputDirectory: ".api"
    },
}