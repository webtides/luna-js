import config, {loadSettings} from "../config";
import glob from "glob";
import path from "path";

const loadApis = async () => {
    const settings = await loadSettings();
    const basePath = path.join(settings.apiDirectory);

    return glob.sync(`${basePath}/**/*.js`).map((file) => {
        const relativePath = file.substring(basePath.length);
        const name = relativePath.split(".js")[0];

        return {
            file,
            name,
            relativePath
        }
    });
};

export {
    loadApis
}
