import {paramCase} from "param-case";
import BaseElementFactory from "@webtides/luna-js/src/framework/engine/element-factory";

import TemplateRenderer from "./template-renderer";

/**
 * The element factory to render the TemplateElement from
 * @webtides/element-js on the server.
 *
 * Takes the component and renders the element from the available data.
 */
export default class ElementFactory extends BaseElementFactory {

    static renderer() {
        return new TemplateRenderer();
    }

    async buildElement() {
        const element = new (this.component.element)();

        const initialProperties = typeof element.properties === 'function' ? element.properties() : {};
        Object.keys(initialProperties).forEach(key => element[key] = initialProperties[key]);

        // Then we are defining the attributes from the element as properties.
        Object.keys(this.attributes).forEach(key => {
            let attributeToDefine = this.attributes[key];
            try {
                attributeToDefine = JSON.parse(this.attributes[key]);
            } catch {}

            element[paramCase(key)] = attributeToDefine;
        });

        return element;
    }

    async mirrorPropertiesToAttributes(context) {
        const { element, dynamicProperties, staticProperties } = context;

        const baseProperties = typeof element.properties === 'function'
            ? element.properties()
            : {};

        const properties = {
            ...dynamicProperties,
            ...staticProperties,
        };

        const attributes = {};
        Object.keys(baseProperties).forEach(key => {
            attributes[key] = properties[key] ?? element[key] ?? baseProperties[key];
        });

        const finalAttributes = {
            ...this.attributes,
            ...attributes,
        };

        /* Allow using the dot notation for defining attributes on the element */
        for (const rawAttributeName of Object.keys(finalAttributes)) {
            const attributeName = rawAttributeName.startsWith('.')
                ? rawAttributeName.substring(1)
                : rawAttributeName;

            const attributeValue = finalAttributes[rawAttributeName];

            delete finalAttributes[rawAttributeName];
            finalAttributes[attributeName] = attributeValue;
        }

        return finalAttributes;
    }

    async template(element) {
        return element.template();
    }
}
