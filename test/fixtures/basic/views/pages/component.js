import {html, LunaElement} from "@webtides/luna-js";

export default class ComponentPage extends LunaElement {

    async loadDynamicProperties() {
        return {
            dynamicProperty: 'MOCHA DYNAMIC PROPERTY'
        }
    }

    static async loadStaticProperties() {
        return {
            staticProperty: 'MOCHA STATIC PROPERTY'
        };
    }

    template() {
        return html`
            ${this.staticProperty}    
            ${this.dynamicProperty}    
        `;
    }
}
