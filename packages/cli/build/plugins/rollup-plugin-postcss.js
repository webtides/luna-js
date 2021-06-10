const postcss = require("postcss");
const path = require("path");
const fs = require("fs");

const basePostcssPluginsBefore = [
    require("postcss-import"),
];

const basePostcssPluginsAfter = [];

module.exports =  function(options) {
    const importers = { };
    const extractedCss = { };
    const idsToExtract = [];

    const processCss = ({ css, plugins, from = process.cwd() }) => {
        return postcss([ ...basePostcssPluginsBefore, ...(plugins()), ...basePostcssPluginsAfter ]).process(css, {
            from
        });
    };

    const processCssAndWatchDependencies = async function (code, id, addWatchFile) {
        const { css, map, messages } = await processCss({
            css: code,
            plugins: options.plugins,
            from: id
        });

        messages.forEach(message => {
            if (message.type === "dependency" && message.plugin === "postcss-import") {
                addWatchFile(message.file);
            }
        });

        return {css, map};
    }

    return {
        name: 'luna-postcss',

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

                const { css, map } = await processCssAndWatchDependencies(code, id, this.addWatchFile);

                const moduleInformation = this.getModuleInfo(importers[id]);

                // Check if the imported css is assigned to a variable. If not, we should extract it.
                moduleInformation.ast.body.map(node => {
                    if (node.type === "ImportDeclaration") {
                        if (path.join(path.dirname(importers[id]), node.source.value) === id
                            && node.specifiers.length === 0) {
                            extractedCss[id] = css;
                        }
                    }
                })

                // We can always export the css, because it will be removed if it is unused.
                return {
                    code: `export default \`${css}\`;`,
                    map
                };
            }

            if (idsToExtract.includes(id)) {
                if (options.ignore) {
                    return "export default null";
                }

                extractedCss[id] = (await processCssAndWatchDependencies(code, id, this.addWatchFile)).css;
                return '';
            }

            return null;
        },

        async writeBundle() {
            if (options.ignore) {
                return;
            }

            const output = path.join(options.publicDirectory, options.output);
            const outputDirectory = path.dirname(output);

            const css = Object.values(extractedCss).join("\r\n");

            if (!fs.existsSync(outputDirectory)) {
                fs.mkdirSync(outputDirectory, { recursive: true });
            }

            console.log("Writing extracted css to", output);

            fs.writeFileSync(output, css, 'utf-8');
        }
    }
}
