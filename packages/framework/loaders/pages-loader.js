import path from "path";
import config from '../config.js';

import {html, renderToString} from "@popeindustries/lit-html-server";
import glob from "glob";

import baseLayoutFactory from "../../client/layouts/base.js";
import {renderComponent} from "../engine/element-renderer";
import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";

const getLayout = async (factory, {context}) => {
    return renderToString(factory({html, context}));
};

const loadSinglePage = async ({file}) => {
    const page = (await import(path.resolve(file)));

    let markup = "";
    let layoutFactory = baseLayoutFactory;

    if (typeof page.default.prototype?.connectedCallback === "undefined") {
        markup = await renderToString(page.default({ html }));

        if (page.layout) {
            // TODO: we really need to find a better way.
            const layoutModule = await import(path.resolve(`${config.layoutsDirectory}/${page.layout}.js`));
            layoutFactory = layoutModule.default;
        }
    } else {
        // We are possibly dealing with a custom element here.
        const component = {
            element: page.default
        };

        const result = (await renderComponent(component, {}));
        markup = result.markup;

        if (result.element.layout) {
            const layoutModule = await import(path.resolve(`${config.layoutsDirectory}/${result.element.layout}.js`));
            layoutFactory = layoutModule.default;
        }
    }

    return getLayout(layoutFactory, {
        context: {
            page: html`${unsafeHTML(markup)}`
        }
    });
};


const loadPages = () => {
    return glob.sync(`${config.pagesDirectory}/**/*.js`).map((file) => {
        const relativePath = file.substring(config.pagesDirectory.length);
        const name = relativePath.split(".page")[0];

        return {
            file,
            name,
            relativePath
        }
    });
};


export {loadPages, loadSinglePage};
