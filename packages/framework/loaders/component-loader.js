import {loadManifest, loadSettings} from "../config.js";
import path from "path";
import {paramCase} from "param-case";

let allAvailableComponents = {};

const isDynamicElement = element => {
    const instance = new element();
    const availableProperties = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));

    return availableProperties.includes("loadDynamicProperties");
};

const loadStaticProperties = async element => {
    if (!element.disableSSR && typeof element.loadStaticProperties === "function") {
        const staticProperties = await element.loadStaticProperties();

        if (staticProperties) {
            return staticProperties;
        }
    }

    return undefined;
};

const registerAvailableComponents = async () => {
    allAvailableComponents = { };

    const settings = await loadSettings();

    const manifest = await loadManifest();

    const basePath = settings._generated.applicationDirectory;

    for (const component of manifest.components) {
        const { file, directory, relativePath, settings, children } = component;
        const absolutePath = path.join(basePath, file);

        const element = require(path.resolve(absolutePath));

        if (typeof element?.prototype?.connectedCallback === "undefined") {
            return;
        }

        element.staticProperties = await loadStaticProperties(element);

        const hasDynamicProperties = isDynamicElement(element);
        const tagName = paramCase(element.name);

        console.log("Register component", tagName);

        allAvailableComponents[tagName] = {
            element,
            tagName,
            hasStaticProperties: typeof element.staticProperties !== "undefined",
            hasDynamicProperties,
            name: element.name,
            file,
            relativePath,
            directory,
            outputDirectory: settings.outputDirectory,
            children
        }
    }

    return allAvailableComponents;
};

const getAvailableComponents = () => allAvailableComponents;

const loadSingleComponentByTagName = async (tagName) => {
    tagName = tagName.toLowerCase();

    const components = getAvailableComponents();

    if (components[tagName]) {
        return components[tagName];
    }

    return false;
};


export {
    loadSingleComponentByTagName,
    registerAvailableComponents,
    loadStaticProperties,
    getAvailableComponents
}
