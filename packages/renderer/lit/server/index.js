import { html, renderToString } from "@popeindustries/lit-html-server";
import { unsafeHTML } from "@popeindustries/lit-html-server/directives/unsafe-html";

const render = (template) => renderToString(template, {
    serializePropertyAttributes: true,
});

export {
    html,
    unsafeHTML,
    render
};
