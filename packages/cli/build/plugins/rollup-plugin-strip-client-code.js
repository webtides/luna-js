const fs = require('fs');
const path = require('path');
const {requireDynamically} = require("./helpers/dynamic-require");

const {getEntryType} = require("./helpers/entries");

/**
 * Looks through the custom server renderers that can be defined in the luna.config.js
 * and swaps all imports on the server with the defined stubs.
 *
 * @param basePaths     The base paths for components and pages.
 * @param settings      The settings that have been loaded from the luna.config.js
 *
 * @returns {*}
 */
module.exports = function ({ basePaths }) {

    const resolvedStubs = {};

    return {
        name: 'luna-strip-client-code',

        async resolveId(source, importer) {
            const entryType = getEntryType(importer, basePaths);

            if (entryType && typeof entryType.settings?.factory === 'string') {
                const { factory } = entryType.settings;

                const factoryModule = requireDynamically(factory);

                const stubs = await factoryModule.stubs();
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
                const stub = resolvedStubs[id];
                return fs.readFileSync(stub, 'utf-8');
            }

            return null;
        },
    }
}
