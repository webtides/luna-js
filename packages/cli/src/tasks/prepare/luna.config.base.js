export default {
    port: 3005,

    build: {
        output: '.build',

        server: {
            resolveNodeModules: [],
        },
    },

    pages: {
        input: [],
        fallback: false
    },

    api: {
        input: [],
        context: '/api',
        fallback: null
    },

    routes: {
        cacheable: []
    },

    components: {
        bundles: []
    },

    hooks: {
        input: []
    },

    assets: {
        domain: null,
        context: null,

        styles: {
            bundles: []
        },

        static: { }
    },

    cache: {
        file: {
            directory: '.storage/cache'
        }
    },

    export: {
        output: '.export',

        api: {
            output: {
                directory: ".api",
                filename: "api-server.js"
            },

            excluded: []
        },
    }
}
