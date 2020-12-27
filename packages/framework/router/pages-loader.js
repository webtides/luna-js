import path from "path";
import config from '../config.js';

import {html, renderToString} from "@popeindustries/lit-html-server";
import glob from "glob";
import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html.js";

import baseLayoutFactory from "../layouts/base.js";

const getLayout = async ({context}) => {
    return renderToString(baseLayoutFactory({html, context}));
};

const loadSinglePage = async ({file}) => {
    let page = (await import(path.resolve(file))).default;

    if (typeof page !== "string") {
        // We are possibly dealing with a custom element here.
        const pageElement = new page();
        page = await renderToString(unsafeHTML(pageElement.template({html})));
    }

    return getLayout({
        context: {page}
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
