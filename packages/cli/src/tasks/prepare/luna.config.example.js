import path from "path";

export default {
    build: {
        output: '.build',
    },

    pages: {
        input: [ path.join(__dirname, 'views/pages') ],
    },

    api: {
        input: [ path.join(__dirname, 'api') ],
    },

    components: {
        bundles: [{
            input: path.join(__dirname, 'views/components'),
            output: 'assets',

            styles: {
                output: 'assets/css/base.css',
                plugins: () => []
            }
        }]
    },

    hooks: {
        input: [ path.join(__dirname, 'hooks') ]
    },

    assets: {
        styles: {
            bundles: [{
                input: [ path.join(__dirname, "assets/css/main.css") ],

                outputDirectory: ".build/public/assets/css",
                filename: "main.css",
                plugins: () => []
            } ]
        },

        static: {
            sources: [ {
                input: "assets/images/**/*", output: ".build/public/assets/images^"
            } ]
        }
    },

    export: {
        output: '.export',

        api: {
            output: {
                directory: ".api",
                filename: "api-server.js"
            }
        },
    },
}
