import { html, LunaElement } from '@webtides/luna-js';

export default class ExampleComponent extends LunaElement {

    properties() {
        return {
            name: 'webtides'
        };
    }

    template() {
        return html`
            Provided to you by ${this.name}.
        `;
    }
}
