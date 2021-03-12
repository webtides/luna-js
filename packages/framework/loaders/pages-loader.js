import path from "path";
import {loadManifest, loadSettings} from '../config.js';

import {html, renderToString} from "@popeindustries/lit-html-server";

import baseLayoutFactory from "../../client/layouts/base.js";
import {renderComponent} from "../engine/element-renderer";
import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";
import {loadStaticProperties} from "./component-loader";
import {loadFromCache, writeToCache} from "../cache/cache";
import {parseMiddleware} from "../http/middleware";

const applyLayout = async (factory, page) => {
    return renderToString(await factory(page));
};

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
