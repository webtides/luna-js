import MoonElement, { html, unsafeHTML } from "./packages/client/elements/moon-element.js";
import MoonDownElement from "./packages/client/elements/moon-down-element";
import baseLayout from "./packages/client/layouts/base.js";
import { HOOKS } from "./packages/framework/hooks/definitions";
import { apiRequest } from "./packages/client/functions/network";
import {BaseElement} from "@webtides/element-js/src/BaseElement";

const layouts = {
    base: baseLayout
}

export {
    MoonElement,
    MoonDownElement,
    BaseElement,
    layouts,
    HOOKS,
    apiRequest,
    html,
    unsafeHTML
}
