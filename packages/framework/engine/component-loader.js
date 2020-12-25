import glob from "glob";
import config from "../config";
import path from "path";
import {paramCase} from "param-case";

const loadComponents = async () => {
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

    return components;
};

export {
    loadComponents
}
