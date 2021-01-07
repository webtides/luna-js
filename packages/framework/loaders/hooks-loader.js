import config, {loadSettings} from "../config";
import glob from "glob";
import path from "path";
import {registerHook} from "../hooks";

const loadHooks = async () => {
    const settings = await loadSettings();

    const fileGroups = settings.hooksDirectory.map(hooksDirectory => {
        return {
            files: glob.sync(`${hooksDirectory}/**/*.js`),
            basePath: hooksDirectory
        }
    });

    await Promise.all(fileGroups.map(async ({ files, basePath }) => {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const module = require(path.resolve(file));
            registerHook(module.name, module.default);
        }
    }));
};

export {
    loadHooks
}
