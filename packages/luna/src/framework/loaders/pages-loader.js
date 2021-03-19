import path from "path";

import {html, renderToString} from "@popeindustries/lit-html-server";
import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";

import baseLayoutFactory from "../../client/layouts/base.js";

import {loadManifest, loadSettings} from '../config.js';
import {renderComponent} from "../engine/element-renderer";
import {loadStaticProperties} from "./component-loader";
import {loadFromCache, writeToCache} from "../cache/cache";
import {parseMiddleware} from "../http/middleware";

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
const applyLayout = async (factory, page) => {
    return renderToString(await factory(page));
};

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
const loadPageModule = async ({file}) => {
    const module = await import(path.resolve(file));
    const page = module.default;

    if (typeof page?.prototype?.connectedCallback !== "undefined") {
        page.staticProperties = await loadStaticProperties(page);
    }

    return {
        module,
        page,
        middleware: await parseMiddleware({ middleware: module.middleware }),
        layout: module.layout
    }
};

/**
 * Loads the content of an anonymous page. Anonymous pages cannot be dynamic, so
 * they can be cached.
 *
 * @param module {{layout: *, module: *, page: *, middleware: *}}   The page module loaded by {@link loadPageModule}
 * @param route string  The route where the page should be registered. Used for the cache.
 *
 * @returns {Promise<{markup: string, layoutFactory: *, element: *}>}
 */
const loadAnonymousPage = async ({ module, route = '' }) => {
    let markup = await loadFromCache(route, 'pages');
    const { page, layout } = module;

    if (!markup) {
        markup = await renderToString(page());
        await writeToCache(route, markup, 'pages');
    }

    return {
        markup,
        element: page,
        layoutFactory: layout
    };
};

/**
 * Loads the content of a content page. Content pages can be dynamic, so we
 * can pass the request and response objects to the page.
 *
 * @param module {{layout: *, module: *, page: *, middleware: *}}   The page module loaded by {@link loadPageModule}
 * @param request *     The express request object.
 * @param response *    The express response object.
 *
 * @returns {Promise<{markup: string, layoutFactory: *, element: *}>}
 */
const loadComponentPage = async ({ module, request, response }) => {
    const { page, layout } = module;

    const component = {
        element: page,
    };

    const result = (await renderComponent({component, attributes: {}, group: 'pages', request, response}));

    // Create a stub for the async layout factory to get them in the same
    // format as the anonymous layout factory. Use the element as context.
    result.layoutFactory = layout ? async page => layout(page, result.element) : false;

    return result;
};

/**
 * Takes a loaded page module and generates the markup. Checks if the page is an anonymous
 * page or a component page and uses {@link loadAnonymousPage} or {@link loadComponentPage} respectively to
 * generate the markup.
 *
 * @param module {{layout: *, module: *, page: *, middleware: *}}   The page module loaded by {@link loadPageModule}
 * @param route string  The route under which the page should be registered.
 * @param request *     The express request object
 * @param response *    The express response object.
 *
 * @returns {Promise<{html: string, element: *}>}
 */
const generatePageMarkup = async ({module, route = '', request, response}) => {
    const result = typeof module.page?.prototype?.connectedCallback === "undefined"
        ? await loadAnonymousPage({ module, route })
        : await loadComponentPage({ module, request, response });


    const page = html`${unsafeHTML(result.markup)}`

    const pageHTML = await applyLayout(result.layoutFactory || (page => baseLayoutFactory(page)), page);

    return {
        html: pageHTML,
        element: result.element
    }
};

/**
 * Loads all available pages (routes) from the generated manifest.
 *
 * @returns {Promise<*[]>}
 */
const loadPages = async () => {
    const settings = await loadSettings();

    const manifest = await loadManifest();
    const basePath = settings._generated.applicationDirectory;

    return Promise.all(manifest.pages.map(async page => {
        const {relativePath, file} = page;
        const module = await loadPageModule({ file: path.join(basePath, file) });

        const name = relativePath.split(".js")[0];

        return {
            file: path.join(basePath, file),
            relativePath,
            name,
            module
        };
    }));
};


export {loadPages, generatePageMarkup};