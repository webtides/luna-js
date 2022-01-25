import { html } from '@popeindustries/lit-html-server';
import { toString } from "@webtides/element-js/src/util/toString";

class TemplateElement {
    constructor(options) {
        this._options = {
            ...(options ?? {}),
        };
    }
}
class StyledElement {}
class BaseElement {}

export { TemplateElement, StyledElement, BaseElement, html, toString }
