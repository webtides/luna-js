import {loadManifest, loadSettings} from "../config";
import path from "path";

/**
 * Loads all available api routes from the generated manifest and registers
 * these hooks.
 *
 * @returns {Promise<{
 *  file: string,
 *  relativePath: string,
 *  route: string,
 *  name: string
 * }[]>}
 */
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
