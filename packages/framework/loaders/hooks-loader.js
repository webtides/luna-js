import {loadManifest, loadSettings} from "../config";
import path from "path";
import {registerHook} from "../hooks";

const loadHooks = async () => {
    const settings = await loadSettings();

    const manifest = await loadManifest();
    const basePath = settings._generated.applicationDirectory;

    manifest.hooks.forEach(({file, relativePath}) => {
        const module = require(path.resolve(path.join(basePath, file)));
        registerHook(module.name, module.default);
    });
};

export {
    loadHooks
}
