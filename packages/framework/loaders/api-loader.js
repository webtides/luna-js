import config, {loadSettings} from "../config";
import glob from "glob";
import path from "path";
import {registerHook} from "../hooks";

const loadApis = async () => {
    const settings = await loadSettings();

    const fileGroups = settings.apiDirectory.map(apiDirectory => {
        return {
            files: glob.sync(`${apiDirectory}/**/*.js`),
            basePath: apiDirectory
        }
    });

    return fileGroups.flatMap(({files, basePath}) => {
        const apis = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const relativePath = file.substring(basePath.length);
            const name = relativePath.split(".js")[0];

            apis.push({
                file,
                name,
                relativePath
            });
        }

        return apis;
    });
};

export {
    loadApis
}
