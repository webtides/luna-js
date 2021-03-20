import {html, LunaElement} from "@webtides/luna-js";

export default class ClientComponent extends LunaElement {

    template() {
        return html`
            CLIENT COMPONENT
        `;
    }

    static get disableSSR() {
        return true;
    }
}
