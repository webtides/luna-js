const path = require("path");
const fs = require("fs");
const frontmatter = require("@github-docs/frontmatter");
const marked = require("marked");

module.exports =  function(options) {
    const importers = { };

    return {
        name: 'moon-markdown',

        async resolveId(source, importer) {
            if (importer && source.endsWith(".md")) {
                const importerDirectory = path.dirname(importer);

                const id = path.join(importerDirectory, source);
                importers[id] = importer;

                return id;
            }

            return null;
        },

        async transform(code, id) {
            if (id.endsWith(".md") && importers[id]) {
                const result = frontmatter(fs.readFileSync(id, { encoding: "utf-8" }));
                const content = marked(result.content);

                const dataExport = `
                    const data = JSON.parse('${JSON.stringify(result.data)}');
                    
                    export {
                        data
                    };
                `;

                return {
                    code: `export default \`${content}\`; ${dataExport}`,
                };
            }

            return null;
        },
    }
}
