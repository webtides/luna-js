import glob from "glob";
import {loadManifest, loadSettings} from "../config.js";
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

    const manifest = await loadManifest();

    const basePath = settings._generated.applicationDirectory;

    for (const component of manifest.components) {
        const { file, relativePath, settings } = component;
        const absolutePath = path.join(basePath, file);

        const element = require(path.resolve(absolutePath));

        if (typeof element?.prototype?.connectedCallback === "undefined") {
            return;
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

        console.log("Register component", tagName);

        allAvailableComponents[tagName] = {
            element,
            tagName,
            hasStaticProperties,
            hasDynamicProperties,
            name: element.name,
            file,
            relativePath,
            outputDirectory: settings.outputDirectory
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
