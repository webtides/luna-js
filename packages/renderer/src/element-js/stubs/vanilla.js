import { html, spreadAttributes, unsafeHTML } from '@webtides/element-js/src/renderer/vanilla/util/html';
import { toString } from "@webtides/element-js/src/util/toString";

class BaseElement {
    constructor(options) {
        this._options = {
            ...(options ?? {}),
        };
    }
}
class StyledElement extends BaseElement {
    constructor(options) {
        super(options);

        this._styles = [...(this._options?.styles ?? []), ...this.styles()];
    }

    styles() {
        return [];
    }
}
class TemplateElement extends StyledElement{
}

export { TemplateElement, StyledElement, BaseElement, html, unsafeHTML, spreadAttributes, toString }
