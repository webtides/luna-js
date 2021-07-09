module.exports = function (renderers = []) {

    const resolvedStubs = {};

    return {
        name: 'luna-strip-client-code',

        async resolveId(source) {
            for (const { renderer } of renderers) {
                for (const { sources, stub } of renderer.stubs) {
                    if (sources.includes(source)) {
                        resolvedStubs[source] = stub;
                        return source;
                    }
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
