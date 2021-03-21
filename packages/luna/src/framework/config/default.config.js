import path from "path";

export default {
    port: 3005,

    build: {
        output: '.build',
        legacy: false
    },

    pages: {
        input: [ path.join(__dirname, 'pages') ],
        fallback: false
    },

    api: {
        input: [ path.join(__dirname, 'api') ],
        context: '/api',
        fallback: false
    },

    routes: {
        cacheable: []
    },

    components: {
        bundles: [{
            input: path.join(__dirname, 'views/components'),
            output: 'assets',

            styles: {
                output: 'assets/css/base.css',
                plugins: []
            }
        }]
    },

    hooks: {
        input: [ path.join(__dirname, 'hooks') ]
    },

    assets: {
        domain: false,
        context: false,

        styles: {
            bundles: []
        },

        static: { }
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
