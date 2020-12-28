import glob from "glob";
import config from "../config.js";
import path from "path";

const loadSingleComponentByTagName = async (tagName) => {
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


export {
    loadSingleComponentByTagName
}
