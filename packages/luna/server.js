import { render as litRender, html } from "lit-html";
import { hydrate } from "lit-html/experimental-hydrate.js";

import { until } from "lit-html/directives/until.js";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { guard } from "lit-html/directives/guard.js";

const render = async (template) => {
    const templateContainer = document.getElementById('template');
    templateContainer.innerHTML = '';
    litRender(template, templateContainer);
    return templateContainer.innerHTML;
}

export {render, hydrate, html, unsafeHTML, guard, until};
