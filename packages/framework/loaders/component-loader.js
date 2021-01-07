import glob from "glob";
import config, {loadSettings, hasManifest} from "../config.js";
import path from "path";
import {setPostcssModule, transformCssModules} from "../../client/styles/postcss-loader";
import {paramCase} from "param-case";

let allAvailableComponents = {};

const isDynamicElement = element => {
    const instance = new element();
    const availableProperties = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));

    return availableProperties.includes("loadDynamicProperties");
};

const registerAvailableComponents = async ({ generateCssBundles = true } = {}) => {
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

        if (generateCssBundles) {
            // Set the current module to let the css parser know which postcss settings to apply.
            setPostcssModule(basePath, styles);
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // By importing the module here, we are also loading the css for the module.
            const module = await import(path.resolve(file));

            const relativePath = file.substring(basePath.length);
            const element = module.default;

            if (typeof element?.prototype?.connectedCallback === "undefined") {
                continue;
            }

            let hasStaticProperties = false;

            if (!element.disableSSR && typeof element.loadStaticProperties === "function") {
                const staticProperties = await element.loadStaticProperties();

                if (staticProperties) {
                    hasStaticProperties = true;
                    element.staticProperties = staticProperties;
                }
            }

            const hasDynamicProperties = isDynamicElement(element);
            const tagName = paramCase(element.name);

            console.log(tagName);

            allAvailableComponents[tagName] = {
                element,
                tagName,
                hasStaticProperties,
                hasDynamicProperties,
                name: element.name,
                file,
                relativePath,
                outputDirectory
            }
        }
    }

    if (generateCssBundles) {
        await transformCssModules();
    }

    return allAvailableComponents;
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
