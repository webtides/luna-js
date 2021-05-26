const fs = require('fs');

module.exports =  function(options) {
    return {
        name: 'luna-entry-files',

        async resolveId(source, importer) {
            if (!importer) {
                // We are dealing with an entry file.
                if (!fs.existsSync(require.resolve(source))) {
                    console.log(`${source} has been removed.`);
                    return `${source}?removed`;
                }
            }

            return null;
        },

        load(id) {
            if (id.endsWith('?removed')) {
                return `export default undefined;`;
            }
        }
    }
}
