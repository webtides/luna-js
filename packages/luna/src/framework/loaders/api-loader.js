import {getSettings, loadManifest} from "../config";
import path from "path";
import {parseMiddleware} from "../http/middleware";

export default class ApiLoader {
    /**
     * Loads the api module and normalizes it so that it can be used
     * for registering api routes.
     *
     * Extracts the middleware and module.
     *
     * @param file string   The path to the api that should be loaded.
     *
     * @returns {Promise<{module: *, middleware: *}>}
     */
    async loadApiModule({file}) {
        const module = await import(path.resolve(file));

        return {
            module,
            middleware: await parseMiddleware({ middleware: module.middleware })
        }
    }


    /**
     * Loads all available api routes from the generated manifest.
     *
     * @returns {Promise<{ apis: *[], fallback: *}>}
     */
    async loadApis() {
        const settings = getSettings();

        const manifest = await loadManifest();
        const basePath = settings._generated.applicationDirectory;

        const apis = [];
        let fallback = false;

        for (const api of manifest.apis) {
            const { route, file } = api;
            const module = await this.loadApiModule({ file: path.join(basePath, file) });

            if (api.fallback) {
                fallback = { module, route };
            } else {
                apis.push({ module, route })
            }
        }

        return {apis, fallbackApi: fallback};
    }
}
