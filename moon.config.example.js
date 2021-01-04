const tailwindcss = require("tailwindcss");
const path = require("path");

module.exports = {
    buildDirectory: ".build",
    publicDirectory: ".build/public",

    pagesDirectory: [ path.join(__dirname, "admin/views/pages"), path.join(__dirname, "cms/pages") ],

    componentsDirectory: [
        {
            basePath: path.join(__dirname, "admin/views/components"),
            outputDirectory: ".build/public/admin/assets",

            styles: {
                outputDirectory: ".build/public/admin/assets/css",
                filename: "admin.css",
                postcssPlugins: [
                    tailwindcss(path.join(__dirname, 'tailwind.config.js')),
                ]
            }
        }
    ],

    layoutsDirectory: path.join(__dirname, "admin/views/layouts"),

    hooksDirectory: [ path.join(__dirname, "admin/hooks") ],
    apiDirectory: [ path.join(__dirname, "admin/api") ],

    legacyBuild: false,

    fallbackRoute: "/cms",
    fallbackApiRoute: "/fallback",

    assets: {
        buildDirectory: ".build/public/assets",

        styles: {
            bundles: [ {
                input: [ path.join(__dirname, "admin/assets/css/base.css") ],

                outputDirectory: ".build/public/admin/assets/css",
                filename: "base.css",

                postcssPlugins: [
                    tailwindcss(path.join(__dirname, 'tailwind.config.js')),
                ]
            } ]
        },

        static: {
            sources: [
                { input: __dirname + "/admin/assets/js/**/*", output: ".build/public/admin/assets/js" },
            ]
        }
    }
}
