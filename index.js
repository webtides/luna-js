import MoonElement, { html, unsafeHTML, guard, until } from "./packages/client/elements/moon-element.js";
import MoonDownElement from "./packages/client/elements/moon-down-element";
import baseLayout from "./packages/client/layouts/base.js";
import { apiRequest } from "./packages/client/functions/network";
import {BaseElement} from "@webtides/element-js/src/BaseElement";
import {TemplateElement} from "@webtides/element-js/src/TemplateElement";

const layouts = {
    base: baseLayout
}

export {
    MoonElement,
    MoonDownElement,

    // element-js
    BaseElement,
    TemplateElement,

    layouts,
    apiRequest,

    // LitHTML
    html,
    unsafeHTML,
    guard,
    until,
}
