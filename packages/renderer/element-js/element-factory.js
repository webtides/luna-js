import {paramCase} from "param-case";
import {LunaService} from "@webtides/luna-js";
import BaseElementFactory from "@webtides/luna-js/src/framework/engine/element-factory";

/**
 * The element factory to render the TemplateElement from
 * @webtides/element-js on the server.
 *
 * Takes the component and renders the element from the available data.
 */
@LunaService({
    as: BaseElementFactory
})
export default class ElementFactory {

    async buildElement({ component, attributes, request, response }) {
        // Create an element instance without calling the constructor to prevent side effects.
        const element = Object.create(component.element.prototype);

        const initialProperties = typeof element.properties === 'function' ? element.properties() : {};
        Object.keys(initialProperties).forEach(key => element[key] = initialProperties[key]);

        // Then we are defining the attributes from the element as properties.
        Object.keys(attributes).forEach(key => {
            let attributeToDefine = attributes[key];
            try {
                attributeToDefine = JSON.parse(attributes[key]);
            } catch {}

            element[paramCase(key)] = attributeToDefine;
        });

        const dynamicProperties = await element.loadDynamicProperties({request, response});

        const properties = {
            ...(component.element.staticProperties ?? {}),
            ...(dynamicProperties ? dynamicProperties : {})
        };

        // At last we are defining external properties.
        Object.keys(properties).forEach(key => {
            element[key] = properties[key];
        });

        // Write the element properties back to attributes.
        Object.keys(initialProperties).forEach(key => {
            if (typeof properties[key] === "undefined") {
                return;
            }

            attributes[paramCase(key)] = typeof properties[key] === "string" ? properties[key] : JSON.stringify(properties[key]);
        });

        return {
            element,
        };
    }

    async template(context) {
        return context.element.template();
    }
}
