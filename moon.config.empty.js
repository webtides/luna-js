const path = require("path");

module.exports = {
    buildDirectory: ".build",
    publicDirectory: ".build/public",

    pagesDirectory: [],

    componentsDirectory: [],

    layoutsDirectory: "",

    hooksDirectory: [],
    apiDirectory: [  ],

    legacyBuild: false,

    fallbackRoute: "/cms",
    fallbackApiRoute: "/fallback",

    assets: {
        buildDirectory: ".build/public/assets",

        styles: {
            bundles: [ ]
        },

        static: {
            sources: []
        }
    }
}
