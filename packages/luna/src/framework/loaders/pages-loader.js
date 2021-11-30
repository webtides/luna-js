import path from "path";

import {loadManifest, loadSettings} from '../config.js';
import {parseMiddleware} from "../http/middleware";
import {LunaService} from "../../decorators/service";
import {importDynamically} from "../helpers/dynamic-import";
import {Component} from "../../decorators/component";

@LunaService({
    name: 'PagesLoader'
})
export default class PagesLoader {

    constructor() {}

    async loadDefaultLayout() {
        const layout = await importDynamically('./views/layouts/base.js');
        return () => layout;
    }

    /**
     * Loads the page module and normalizes it so that it can be used
     * for registering page routes.
     *
     * Extracts the middleware, module and page content.
     *
     * @param file string   The path to the page that should be loaded.
     * @param settings *    The page settings loaded from the manifest
     *
     * @returns {Promise<{layout: *, module: *, page: *, middleware: *}>}
     */
    async loadPageModule({file, settings}) {
        const module = await import(path.resolve(file));
        const page = module.default;

        const isComponentPage = page.prototype?.constructor?.toString().indexOf('class') === 0;

        const ElementFactory = settings.factory
            ? (await importDynamically(settings.factory)).ElementFactory
            : await luna.getDefaultElementFactory();

        if (isComponentPage) {
            page.staticProperties =  typeof page.loadStaticProperties === 'function'
                ? (await page.loadStaticProperties()) ?? {}
                : {};
        }

        return {
            module,
            page,
            isComponentPage,
            middleware: await parseMiddleware({middleware: module.middleware}),
            ElementFactory
        };
    }

    /**
     * Loads all available pages (routes) from the generated manifest.
     *
     * @returns {Promise<{ fallback: *, pages: *[]}>}
     */
    async loadPages() {
        const settings = await loadSettings();
        const manifest = await loadManifest();

        const basePath = settings._generated.applicationDirectory;

        const pages = [];
        let fallback = false;

        for (const page of manifest.pages) {
            const {file, route, settings } = page;
            const module = await this.loadPageModule({
                file: path.join(basePath, file),
                settings,
            });

            if (page.fallback ?? false) {
                fallback = { module, route };
            } else {
                pages.push({ module, route });
            }
        }

        return {
            fallbackPage: fallback, pages
        };
    }
}
