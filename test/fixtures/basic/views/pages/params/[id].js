import {html, LunaElement} from "@webtides/luna-js";

export default class ParamPage extends LunaElement {

    async loadDynamicProperties({ request }) {
        return {
            id: request.params.id
        }
    }

    template() {
        return html`
            ID: ${this.id}
        `;
    }
}
