import glob from "glob";
import config from "../config.js";
import path from "path";
import {paramCase} from "param-case";

let cachedComponents = false;

const loadCustomElement = async (tagName) => {
    const files = glob.sync(`${config.componentsDirectory}/**/${tagName}.js`);

    if (files.length === 0) {
        return false;
    }

    const file = files[0];

    const module = await import(path.resolve(file));
    const relativePath = file.substring(config.componentsDirectory.length);

    const element = module.default;
    return {
        element,
        name: element.name,
        file,
        relativePath
    };
};

const loadCustomElements = async () => {
    if (!cachedComponents) {
        const components = { };

        await Promise.all(
            glob.sync(`${config.componentsDirectory}/**/*.js`).map(async (file) => {
                const module = await import(path.resolve(file));
                const relativePath = file.substring(config.componentsDirectory.length);

                const element = module.default;
                components[paramCase(element.name)] = {
                    element,
                    name: element.name,
                    file,
                    relativePath
                };
            })
        );

        cachedComponents = components;
    }

    return cachedComponents;
};

export {
    loadCustomElements,
    loadCustomElement
}
