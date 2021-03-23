import {loadManifest, loadSettings} from "../config";
import path from "path";
import {registerHook} from "../hooks";


/**
 * Loads all available hooks from the generated manifest and registers
 * these hooks.
 *
 * @returns {Promise<*[]>}
 */
const loadHooks = async () => {
    const settings = await loadSettings();

    const manifest = await loadManifest();
    const basePath = settings._generated.applicationDirectory;

    manifest.hooks.forEach(({file}) => {
        const module = require(path.resolve(path.join(basePath, file)));
        registerHook(module.name, module.default);
    });
};

export {
    loadHooks
}
