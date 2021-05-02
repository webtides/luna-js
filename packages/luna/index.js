import LunaElement, { html, unsafeHTML } from "./src/client/elements/luna-element.js";
import LunaMarkdownElement from "./src/client/elements/luna-markdown-element";
import { apiRequest } from "./src/client/functions/network";
import {BaseElement} from "@webtides/element-js/src/BaseElement";
import {TemplateElement} from "@webtides/element-js/src/TemplateElement";
import { HideFromClient } from "./src/decorators/visibility";
import { LunaService, Inject } from "./src/decorators/service";
import { HydrateOnConnected, TagName } from "./src/decorators/client";

export {
    LunaElement,
    LunaMarkdownElement,

    LunaService,
    Inject,
    HideFromClient,
    HydrateOnConnected,
    TagName,

    // element-js
    BaseElement,
    TemplateElement,

    apiRequest,

    html,
    unsafeHTML,
    // guard,
    // until,
}
