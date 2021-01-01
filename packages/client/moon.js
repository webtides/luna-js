import { html, render } from "lit-html";
import { unsafeHTML} from "lit-html/directives/unsafe-html";

window.unsafeHTML = unsafeHTML;
window.html = html;
window.render = render;
