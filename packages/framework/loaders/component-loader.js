import glob from "glob";
import config, {loadSettings} from "../config.js";
import path from "path";
import {paramCase} from "param-case";
import {setPostcssModule, transformCssModules} from "../../client/styles/postcss-loader";

let allAvailableComponents = {};

const registerAvailableComponents = async () => {
    allAvailableComponents = { };

    const settings = await loadSettings();

    const bundles = settings.componentsDirectory.map(({ basePath, styles, outputDirectory }) => {
        return {
            files: glob.sync(`${basePath}/**/*.js`),
            basePath,
            styles,
            outputDirectory
        }
    });

    for (const bundle of bundles) {
        const { files, basePath, styles, outputDirectory } = bundle;

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
                relativePath,
                outputDirectory
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
