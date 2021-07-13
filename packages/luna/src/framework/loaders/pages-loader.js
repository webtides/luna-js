import path from "path";

import {loadManifest, loadSettings} from '../config.js';
import {parseMiddleware} from "../http/middleware";
import {Inject, LunaService} from "../../decorators/service";
import ComponentLoader from "./component-loader";
import ElementRenderer from "../engine/element-renderer";
import LunaCache from "../cache/luna-cache";

@LunaService({
    name: 'PagesLoader'
})
export default class PagesLoader {
    @Inject(LunaCache) cache;
    @Inject(ComponentLoader) componentLoader;
    @Inject(ElementRenderer) elementRenderer;

    constructor() {}

    /**
     * Takes a page and a layout factory and wraps the pages
     * with the layout.
     *
     * Replaces the ${page} variable inside the layout.
     *
     * @param factory (page) => *   The layout factory which should be used
     * @param page *                The html page fragment.
     *
     * @returns {Promise<string>}
     */
    async applyLayout(factory, page) {
        const factoryResult = await factory(page);
        return (await luna.getDefaultElementFactory()).renderer().renderToString(factoryResult);
    }

    /**
     * Loads the page module and normalizes it so that it can be used
     * for registering page routes.
     *
     * Extracts the middleware, module and page content.
     *
     * @param file string   The path to the page that should be loaded.
     *
     * @returns {Promise<{layout: *, module: *, page: *, middleware: *}>}
     */
    async loadPageModule({file}) {
        const module = await import(path.resolve(file));
        const page = module.default;

        return {
            module,
            page,
            middleware: await parseMiddleware({middleware: module.middleware}),
            layout: module.layout
        }
    }

    /**
     * Loads the content of an anonymous page. Anonymous pages cannot be dynamic, so
     * they can be cached.
     *
     * @param module {{layout: *, module: *, page: *, middleware: *}}   The page module loaded by {@link loadPageModule}
     * @param route string  The route where the page should be registered. Used for the cache.
     * @param request *     The express request object
     * @param response *    The express response object.
     * @param container ServiceContext
     *
     * @returns {Promise<{markup: string, layoutFactory: *, element: *}|boolean>}
     */
    async loadAnonymousPage({module, route = '', request, response, container}) {
        const {page, layout} = module;

        if (typeof page !== 'function') {
            return false;
        }

        return {
            markup: await page({ request, response, container }),
            element: page,
            layoutFactory: layout
        };
    }

    /**
     * Takes a loaded page module and generates the markup. Checks if the page is an anonymous
     * page or a component page and uses {@link loadAnonymousPage} or {@link loadComponentPage} respectively to
     * generate the markup.
     *
     * @param module {{layout: *, module: *, page: *, middleware: *}}   The page module loaded by {@link loadPageModule}
     * @param route string  The route under which the page should be registered.
     * @param request *     The express request object
     * @param response *    The express response object.
     * @param container ServiceContext
     *
     * @returns {Promise<{html: string|boolean, element: *}>}
     */
    async generatePageMarkup({module, route = '', request, response, container}) {
        const result = await this.loadAnonymousPage({module, route, request, response, container})

        if (!result) {
            return { html: false };
        }

        const page = result.markup;

        if (!result.layoutFactory) {
            throw new Error('You need to define a "LayoutFactory".')
        }

        const pageHTML = await this.applyLayout(result.layoutFactory, page);

        return {
            html: pageHTML,
            element: result.element
        }
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
            const {file, route} = page;
            const module = await this.loadPageModule({file: path.join(basePath, file)});

            if (page.fallback ?? false) {
                fallback = {module, route};
            } else {
                pages.push({ module, route });
            }
        }

        return {
            fallbackPage: fallback, pages
        };
    }
}
