module.exports = function ({ stubs } = {}) {

    const resolvedStubs = {};

    return {
        name: 'luna-strip-client-code',

        async resolveId(source) {
            if (!stubs) {
                return null;
            }

            for (const { stub, sources } of stubs) {
                if (sources.includes(source)) {
                    resolvedStubs[source] = stub;
                    return source;
                }
            }

            return null;
        },

        async load(id) {
            if (resolvedStubs[id]) {
                return resolvedStubs[id];
            }

            return null;
        },
    }
}
