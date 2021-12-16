export default {
    port: 3005,

    build: {
        output: '.build',
        livereload: true,

        server: {
            resolveNodeModules: [],
        }
    },

    pages: {
        input: [],
        fallback: false
    },

    api: {
        input: [],
        context: '/api',
        fallback: false
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
        domain: false,
        context: false,

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
