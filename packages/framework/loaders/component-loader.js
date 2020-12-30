import glob from "glob";
import config from "../config.js";
import path from "path";
import {paramCase} from "param-case";

const allAvailableComponents = { };

const registerAvailableComponents = async () => {
    const files = glob.sync(`${config.componentsDirectory}/**/*.js`);

    await Promise.all(files.map(async (file) => {
        const module = await import(path.resolve(file));

        const relativePath = file.substring(config.componentsDirectory.length);
        const element = module.default;

        if (typeof element?.prototype?.connectedCallback === "undefined") {
            return;
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
    }));
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
