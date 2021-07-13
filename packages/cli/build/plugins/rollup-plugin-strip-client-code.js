const fs = require('fs');

module.exports = function (renderers = []) {

    const resolvedStubs = {};

    return {
        name: 'luna-strip-client-code',

        async resolveId(source) {
            for (const { renderer } of renderers) {
                const stubs = await (await renderer()).stubs();

                for (const { sources, stub } of stubs) {
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
                const stub =  resolvedStubs[id];
                return fs.readFileSync(stub, 'utf-8');
            }

            return null;
        },
    }
}
