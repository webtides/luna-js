import config from "../config";
import glob from "glob";

const loadApis = async () => {

    return glob.sync(`${config.apiDirectory}/**/*.js`).map((file) => {
        const relativePath = file.substring(config.apiDirectory.length + 1);
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
