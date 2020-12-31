import config, {loadSettings} from "../config";
import glob from "glob";
import path from "path";
import {registerHook} from "../hooks";

const loadHooks = async () => {
    const settings = await loadSettings();
    const basePath = path.join(settings.buildDirectory, settings.hooksDirectory);

    await Promise.all(glob.sync(`${basePath}/**/*.js`)
        .map(async (file) => {
            const module = await import(path.resolve(file));

            registerHook(module.name, module.default);
        }));
};

export {
    loadHooks
}
