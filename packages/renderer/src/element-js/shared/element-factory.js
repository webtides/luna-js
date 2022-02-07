import BaseElementFactory from "@webtides/luna-js/src/framework/engine/element-factory";


export default (templateRenderer) => {
    /**
     * The element factory to render the TemplateElement from
     * "@webtides/element-js" on the server.
     *
     * Takes the component and renders the element from the available data.
     */
    return class ElementFactory extends BaseElementFactory {

        static renderer() {
            return new templateRenderer();
        }

        async getAdditionalAttributes() {
            return {
                ...(await super.getAdditionalAttributes()),
                'defer-update': true,
            };
        }

        modifyAttributeBeforeFinalization(attributeName, attributeValue) {
            if (attributeValue === true || attributeValue === false) {
                attributeValue = `${attributeValue}`;
            }

            return super.modifyAttributeBeforeFinalization(attributeName, attributeValue);
        }

        async getInitialProperties() {
            return typeof this.element.properties === 'function'
                ? this.element.properties()
                : {};
        }

        async shouldRender() {
            return typeof this.element.template === 'function';
        }

        async template() {
            return this.element.template();
        }
    }
};