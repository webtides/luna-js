import TemplateElement from "./packages/client/elements/template-element.js";
import baseLayout from "./packages/client/layouts/base.js";
import { HOOKS } from "./packages/framework/hooks/definitions";

const layouts = {
    base: baseLayout
}

export {
    TemplateElement,
    layouts,
    HOOKS
}
