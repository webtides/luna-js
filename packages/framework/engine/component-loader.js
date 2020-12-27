import glob from "glob";
import config from "../config.js";
import path from "path";
import {paramCase} from "param-case";
import {existsSync} from "fs";

let cachedComponents = false;

const loadCustomElement = async (tagName) => {
    const file = `${config.componentsDirectory}/${tagName}/${tagName}.js`;

    if (!existsSync(file)) {
        return false;
    }

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
                console.log(file);
                const module = await import(path.resolve(file));
                console.log(module);
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
