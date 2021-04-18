export default {
    port: 3005,

    build: {
        output: '.build',
        legacy: false,
        livereload: true
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
