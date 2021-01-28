const {proxy} = require("../../lib/packages/cli/tasks/build/esm-proxy");

const path = require("path");
const fs = require("fs");
const {processCss} = require("./postcss/postcss-loader");

module.exports =  function(options) {
    const importers = { };
    let extractedCss = { };

    const idsToExtract = [];

    return {
        name: 'moon-postcss',

        async resolveId(source, importer) {
            if (source.endsWith(".css")) {
                if (!!importer) {
                    const importerDirectory = path.dirname(importer);

                    const id = path.join(importerDirectory, source);
                    importers[id] = importer;

                    return id;
                }

                // We have imported the css file directly.
                idsToExtract.push(source);
                return source;
            }

            return null;
        },

        async transform(code, id) {
            if (id.endsWith(".css") && importers[id]) {
                if (options.ignore) {
                    return "export default null";
                }

                // TODO: find a better way with support for modern language features.
                const module = proxy(importers[id]).default;
                const element = new module();

                const extractCss = !(options.serverBuild || false) && element._options.shadowRender;

                // We only need the process the css if it should be inside the components shadow.
                if (extractCss) {
                    console.log("Extract css for", importers[id]);
                    const {css, map} = await processCss({ css: code, plugins: options.postcssPlugins });

                    return {
                        code: `export default \`${css}\`;`,
                        map
                    };
                } else {
                    extractedCss[id] = code;
                    return "export default null";
                }
            }

            if (idsToExtract.includes(id)) {
                extractedCss[id] = code;
                return '';
            }

            return null;
        },

        async writeBundle() {
            if (options.ignore) {
                return;
            }

            const extracted = Object.keys(extractedCss).map(key => extractedCss[key]).join("\r\n");

            const {css, map} = await processCss({ css: extracted, plugins: options.postcssPlugins });

            if (!fs.existsSync(options.outputDirectory)) {
                fs.mkdirSync(options.outputDirectory, { recursive: true });
            }

            console.log("Writing extracted css to", options.outputDirectory, options.filename);

            fs.writeFileSync(path.join(options.outputDirectory, options.filename), css, { encoding: "utf-8" });
        }
    }
}
