import glob from "glob";
import config, {loadSettings} from "../config.js";
import path from "path";
import {paramCase} from "param-case";
import {setPostcssModule, transformCssModules} from "../../client/styles/postcss-loader";

const allAvailableComponents = {};

const registerAvailableComponents = async () => {
    const settings = await loadSettings();

    const fileGroups = settings.componentsDirectory.map(({ basePath, styles }) => {
        return {
            files: glob.sync(`${basePath}/**/*.js`),
            basePath,
            styles
        }
    });

    for (const group of fileGroups) {
        const { files, basePath, styles } = group;

        // Set the current module to let the css parser know which postcss settings to apply.
        setPostcssModule(basePath, styles);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // By importing the module here, we are also loading the css for the module.
            const module = await import(path.resolve(file));

            const relativePath = file.substring(basePath.length);
            const element = module.default;

            if (typeof element?.prototype?.connectedCallback === "undefined") {
                continue;
            }

            if (!element.disableSSR && typeof element.loadStaticProperties === "function") {
                const staticProperties = await element.loadStaticProperties();

                if (staticProperties) {
                    element.staticProperties = staticProperties;
                }
            }

            const tagName = paramCase(element.name);

            allAvailableComponents[tagName] = {
                element,
                tagName,
                name: element.name,
                file,
                relativePath
            }
        }
    }

    await transformCssModules();
};

const getAvailableComponents = () => allAvailableComponents;

const loadSingleComponentByTagName = async (tagName) => {
    const components = getAvailableComponents();

    if (components[tagName]) {
        return components[tagName];
    }

    return false;
};


export {
    loadSingleComponentByTagName,
    registerAvailableComponents,
    getAvailableComponents
}
