import glob from "glob";
import {loadSettings} from "../config.js";
import path from "path";
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

    const bundles = settings.componentsDirectory.map((bundle) => {
        const { basePath } = bundle._generated;
        const { outputDirectory } = bundle;

        return {
            files: glob.sync(`${basePath}/**/*.js`),
            basePath,
            outputDirectory
        }
    });

    for (const bundle of bundles) {
        const { files, basePath, outputDirectory } = bundle;

        console.log(files);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const element = require(path.resolve(file));

            const relativePath = file.substring(basePath.length);

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
