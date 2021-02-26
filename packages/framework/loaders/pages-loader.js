import path from "path";
import {loadManifest, loadSettings} from '../config.js';

import {html, renderToString} from "@popeindustries/lit-html-server";

import baseLayoutFactory from "../../client/layouts/base.js";
import {renderComponent} from "../engine/element-renderer";
import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";

const applyLayout = async (factory, page) => {
    return renderToString(await factory(page));
};

const loadPageModule = async ({file}) => {
    const module = await import(path.resolve(file));

    return {
        module,
        page: module.default,
        layout: module.layout
    }
};

const loadAnonymousPage = async ({ module, request, response }) => {
    const { page, layout } = module;

    const markup = await renderToString(page({request, response}));

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

    const result = (await renderComponent({component, attributes: {}, request, response}));

    // Create a stub for the async layout factory to get them in the same
    // format as the anonymous layout factory. Use the element as context.
    result.layoutFactory = layout ? async page => layout(page, result.element) : false;

    return result;
};

const loadSinglePage = async ({file, request, response}) => {
    const module = await loadPageModule({file});

    const result = typeof module.page?.prototype?.connectedCallback === "undefined"
        ? await loadAnonymousPage({ module, request, response })
        : await loadComponentPage({ module, request, response });


    const page = html`${unsafeHTML(result.markup)}`

    const pageHTML = await applyLayout(result.layoutFactory ?? (page => baseLayoutFactory(page)), page);

    return {
        html: pageHTML,
        element: result.element
    }
};

const loadPages = async () => {
    const settings = await loadSettings();

    const manifest = await loadManifest();
    const basePath = settings._generated.applicationDirectory;

    return manifest.pages.map(page => {
        const {relativePath, file} = page;

        const name = relativePath.split(".js")[0];

        return {
            file: path.join(basePath, file),
            relativePath,
            name
        };
    });
};


export {loadPages, loadSinglePage};
