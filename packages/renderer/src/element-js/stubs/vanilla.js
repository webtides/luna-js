import { html, spreadAttributes, unsafeHTML } from '@webtides/element-js/src/renderer/vanilla/util/html';
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

export { TemplateElement, StyledElement, BaseElement, html, unsafeHTML, spreadAttributes, toString }
