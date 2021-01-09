import path from "path";
import {loadManifest, loadSettings} from '../config.js';

import {html, renderToString} from "@popeindustries/lit-html-server";

import baseLayoutFactory from "../../client/layouts/base.js";
import {renderComponent} from "../engine/element-renderer";
import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";

const getLayout = async (factory, {context}) => {
    return renderToString(factory({html, context}));
};

const loadPageMetaData = async ({file}) => {
    const page = require(path.resolve(file));

    const pageElement = typeof page?.default === "undefined" ? page : page.default;

    const availableMethods = [];
    if (typeof pageElement.prototype?.connectedCallback === "undefined") {
        if (typeof page.post === "function") {
            availableMethods.push("post");
        }
    } else {
        const element = new (pageElement)();

        if (typeof element.post === "function") {
            availableMethods.push("post");
        }
    }

    return {
        availableMethods,
        page
    }
};

const loadSinglePage = async ({page, request, response}) => {
    const settings = await loadSettings();

    let markup = "";
    let layoutFactory = baseLayoutFactory;

    const pageElement = typeof page?.default === "undefined" ? page : page.default;

    let element;
    if (typeof pageElement?.prototype?.connectedCallback === "undefined") {
        markup = await renderToString(page.default({html, request, response}));

        if (page.layout) {
            const layoutModule = page.layout;
            layoutFactory = typeof layoutModule === "function" ? layoutModule : layoutModule.default;
        }

        element = page;

    } else {
        // We are dealing with a custom element here.
        const component = {
            element: pageElement,
        };

        const result = (await renderComponent({component, attributes: {}, request, response}));

        markup = result.markup;
        element = result.element;

        if (result.element.layout) {
            const layoutModule = result.element.layout;
            layoutFactory = layoutModule.default;
        }
    }

    const pageHTML = await getLayout(layoutFactory, {
        context: {
            page: html`${unsafeHTML(markup)}`
        }
    });

    return {
        html: pageHTML,
        element
    }
};

const loadPages = async () => {
    const settings = await loadSettings();

    const manifest = await loadManifest();
    const basePath = settings._generated.applicationDirectory;

    return manifest.pages.map(page => {
        const { relativePath, file } = page;

        const name = relativePath.split(".js")[0];

        return {
            file: path.join(basePath, file),
            relativePath,
            name
        };
    });
};


export {loadPages, loadSinglePage, loadPageMetaData};
