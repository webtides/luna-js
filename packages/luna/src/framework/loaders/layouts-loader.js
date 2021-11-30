import path from "path";

import {loadManifest, loadSettings} from '../config.js';
import {LunaService} from "../../decorators/service";

@LunaService({
    name: 'LayoutsLoader'
})
export default class LayoutsLoader {

    #layouts = { };

    constructor() {}

    async registerAvailableLayouts() {
        const settings = await loadSettings();
        const manifest = await loadManifest();

        const basePath = settings._generated.applicationDirectory;

        for (const layoutOptions of manifest.layouts) {
            const { file, name } = layoutOptions;

            this.#layouts[name] = (await import(path.resolve(path.join(basePath, file)))).default;
        }
    }

    getLayoutByName(name) {
        return this.#layouts[name];
    }
}
