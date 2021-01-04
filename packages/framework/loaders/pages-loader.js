import path from "path";
import config, {loadSettings} from '../config.js';

import {html, renderToString} from "@popeindustries/lit-html-server";
import glob from "glob";

import baseLayoutFactory from "../../client/layouts/base.js";
import {renderComponent} from "../engine/element-renderer";
import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";

const getLayout = async (factory, {context}) => {
    return renderToString(factory({html, context}));
};

const loadPageMetaData = async ({file}) => {
    const page = (await import(path.resolve(file)));

    const availableMethods = [];
    if (typeof page.default.prototype?.connectedCallback === "undefined") {
        if (typeof page.post === "function") {
            availableMethods.push("post");
        }
    } else {
        const element = new (page.default)();

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

    let element;

    if (typeof page.default.prototype?.connectedCallback === "undefined") {
        markup = await renderToString(page.default({html, request, response}));

        if (page.layout) {
            const layoutModule = page.layout;
            layoutFactory = typeof layoutModule === "function" ? layoutModule : layoutModule.default;
        }

        element = page;

    } else {
        // We are dealing with a custom element here.
        const component = {
            element: page.default,
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

    return settings.pagesDirectory.flatMap(basePath => {
        console.log("Load pages in", basePath);

        const files = glob.sync(path.join(basePath, `**/*.js`));
        const pages = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const relativePath = file.substring(basePath.length);
            const name = relativePath.split(".js")[0];

            pages.push({
                file,
                name,
                relativePath
            });
        }

        return pages;
    });
};


export {loadPages, loadSinglePage, loadPageMetaData};
