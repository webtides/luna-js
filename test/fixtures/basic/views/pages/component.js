import layout from "../layouts/base";
export { layout };

export default class ComponentPage {

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
        return `
            ${this.staticProperty}    
            ${this.dynamicProperty}    
        `;
    }
}
