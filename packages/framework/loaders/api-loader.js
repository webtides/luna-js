import {loadManifest, loadSettings} from "../config";
import path from "path";

const loadApis = async () => {
    const settings = await loadSettings();

    const manifest = await loadManifest();
    const basePath = settings._generated.applicationDirectory;

    return manifest.apis.map(({route, file, relativePath}) => {
        const name = relativePath.split(".js")[0];

        return {
            file: path.join(basePath, file),
            relativePath,
            route,
            name
        }
    });
};

export {
    loadApis
}
