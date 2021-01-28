const path = require("path");
const postcss = require("postcss");
const fs = require("fs");

const postcssPlugins = [
    require("postcss-import"),
    require("postcss-preset-env")({ stage: 1 }),
];

/**
 * The loaded styles, grouped by their modulePath.
 * @type {{}}
 */
const loadedStyles = { };
const postcssSettings = { };

const requireExtension = (currentModulePath) => {
    return (module, filename) => {
        const css = fs.readFileSync(filename, 'utf8');

        if (currentModulePath) {
            loadedStyles[currentModulePath] ? loadedStyles[currentModulePath].push(css) : loadedStyles[currentModulePath] = [ css ];
            module.exports = "";
            return;
        }

        module.exports = css;
    };
}

const processCss = ({ css, plugins }) => {
    return postcss([ ...postcssPlugins, ...plugins ]).process(css);
}

const transformCssModules = async () => {
    Object.keys(loadedStyles).map(async basePath => {
        const styles = loadedStyles[basePath];
        const settings = postcssSettings[basePath];

        const css = styles.join("\r\n");

        const result = await processCss({ css, plugins: settings.postcssPlugins });

        const { outputDirectory, filename } = settings;

        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory, { recursive: true });
        }

        fs.writeFileSync(path.join(outputDirectory, filename), result.css, { encoding: "utf-8" });
    });
};


module.exports = {
    processCss
};
