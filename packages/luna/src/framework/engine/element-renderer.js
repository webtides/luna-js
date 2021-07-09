import {Inject, LunaService} from "../../decorators/service";
import ElementFactory from "./element-factory";

@LunaService({
    name: 'ElementRenderer'
})
export default class ElementRenderer {
    async buildElement({ component, attributes = {}, request, response }) {
        component.element.prototype.$$luna = {
            request,
            response,
        };

        const factory = new (component.ElementFactory)({ component, attributes, request, response });

        const element = await factory.buildElement();

        const dynamicProperties = typeof element.loadDynamicProperties === 'function'
            ? await element.loadDynamicProperties({request, response})
            : {};

        const properties = {
            ...component.element.staticProperties,
            ...dynamicProperties,
        };

        // At last we are defining external properties.
        Object.keys(properties).forEach(key => {
            element[key] = properties[key];
        });

        const finalAttributes = await factory.mirrorPropertiesToAttributes({
            element,
            dynamicProperties,
            staticProperties: (component.element.staticProperties ?? {}),
        });

        // Create an instance of a dynamic element factory class which can be overridden by the developer.
        // const result = await factory.buildElement();

        // Inject the current luna instance into the element.
        if (!element) {
            throw new Error('The "ElementFactory" needs to at least return an element to inject the current request.')
        }

        return { factory, element, finalAttributes };
    }

    /**
     * Takes a single component object and renders the element.
     * Fetches all dynamic properties for the component & loads
     * the static properties.
     *
     * @param component ({ element: * })
     * @param attributes
     * @param request
     * @param response
     * @param group string      The component cache group. Can be used to use different caches for
     *                          different types of components.
     *
     * @returns {Promise<{markup: string, element: *}>}
     */
    async renderComponent({component, attributes = {}, group = 'components', request, response}) {
        const { factory, element, finalAttributes } = await this.buildElement({
            component, attributes, group, request, response,
        });

        const template = factory.template(element);
        const markup = await component.ElementFactory.renderer().renderToString(template);

        return { markup, element, finalAttributes };
    };
}
