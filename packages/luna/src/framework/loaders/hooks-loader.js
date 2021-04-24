import {loadManifest, loadSettings} from "../config.js";
import {registerHook} from "../hooks/index.js";
import path from "path";
import {LunaService} from "../../decorators/service.js";

@LunaService({
    name: 'HooksLoader'
})
export default class HooksLoader {
    /**
     * Loads all available hooks from the generated manifest and registers
     * these hooks.
     *
     * @returns {Promise<*[]>}
     */
    async loadHooks() {
        const settings = await loadSettings();

        const manifest = await loadManifest();
        const basePath = settings._generated.applicationDirectory;

        manifest.hooks.forEach(({file}) => {
            const module = require(path.resolve(path.join(basePath, file)));
            registerHook(module.name, module.default);
        });
    };
}
