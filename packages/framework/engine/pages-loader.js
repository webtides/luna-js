import path from "path";
import config from '../config.js';

import {html, renderToString} from "@popeindustries/lit-html-server";
import glob from "glob";

import baseLayoutFactory from "../layouts/base.js";
import {renderComponent} from "./element-renderer";

const getLayout = async ({context}) => {
    return renderToString(baseLayoutFactory({html, context}));
};

const loadSinglePage = async ({file}) => {
    let page = (await import(path.resolve(file))).default;

    if (typeof page !== "string") {
        // We are possibly dealing with a custom element here.
        const component = {
            element: page
        };

        page = (await renderComponent(component, {})).markup;
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
