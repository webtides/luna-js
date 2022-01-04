import BaseElementFactory from "@webtides/luna-js/src/framework/engine/element-factory";

import TemplateRenderer from "./template-renderer";

/**
 * The element factory to render the LitElement from lit on the server.
 */
export default class ElementFactory extends BaseElementFactory {
    static renderer() {
        return new TemplateRenderer();
    }

    async getInitialProperties() {
        return typeof this.element.properties === 'function'
            ? this.element.properties()
            : {};
    }

    async shouldRender() {
        return typeof this.element.render !== 'function';
    }

    async template() {
        return this.element.render();
    }
}
