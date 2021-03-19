const path = require("path");

module.exports = {
    buildDirectory: ".build",
    publicDirectory: ".build/public",

    pagesDirectory: [ path.join(__dirname, "views/pages") ],

    componentsDirectory: [
        {
            basePath: path.join(__dirname, "views"),
            directory: "components",
            outputDirectory: ".build/public/assets",

            styles: {
                outputDirectory: ".build/public/assets/css",
                filename: "base.css",
                postcssPlugins: () => {
                    return [];
                }
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
            bundles: [{
                input: [ path.join(__dirname, "assets/css/main.css") ],

                outputDirectory: ".build/public/assets/css",
                filename: "main.css",
                postcssPlugins: () => {
                    return [];
                }
            } ]
        },

        static: {
            sources: [ {
                input: "assets/images/**/*", output: ".build/public/assets/images^"
            } ]
        }
    },

    export: {
        outputDirectory: ".export",
        apiOutputDirectory: ".api"
    },
}
