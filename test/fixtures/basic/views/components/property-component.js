import {html, LunaElement} from "@webtides/luna-js";

export default class PropertyComponent extends LunaElement {

    properties() {
        return {
            foo: "bar"
        }
    }

    template() {
        return html`
            PROPERTY COMPONENT ${this.foo}
        `;
    }
}
