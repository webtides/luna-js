import TemplateRenderer from "./template-renderer";

export default class ElementFactory {
    static renderer() {
        return new TemplateRenderer();
    }

    /**
     * The properties the element itself has defined.
     *
     * @type {{}}
     */
    properties = {};

    /**
     *
     * @param component     The component which includes a element.
     * @param attributes    The attributes that are already written on the element.
     */
    constructor({ component, attributes }) {
        this.component = component;
        this.attributes = attributes ?? {};
    }

    async buildElement() {
        const element = new (this.component.element)(this.attributes);
        
        Object.keys(this.attributes).forEach(key => element[key] = this.attributes[key]);

        return element;
    }

    async mirrorPropertiesToAttributes(context) {
        const { dynamicProperties, staticProperties } = context;

        return {
            ...staticProperties,
            ...this.attributes,
            ...dynamicProperties,
        };
    }

    async template(element) {
        return element.template;
    }

    define({ importPath }) {
        return `
            import ${this.component.name} from "${importPath}";
            customElements.define("${this.component.tagName}", ${this.component.name});
        `;
    }
}
