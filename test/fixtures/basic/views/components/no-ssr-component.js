import {html, LunaElement} from "@webtides/luna-js";

export default class NoSsrComponent extends LunaElement {

    template() {
        return html`
            NO SSR COMPONENT
            
            <client-component></client-component>
        `;
    }

    static get disableSSR() {
        return true;
    }
}
