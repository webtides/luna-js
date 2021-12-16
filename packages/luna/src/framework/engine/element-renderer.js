import {LunaService} from "../../decorators/service";
import {paramCase} from "param-case";


/**
 * The element renderer is the "interface" between luna and other custom element factories.
 * It takes a dom node with attributes, builds the corresponding custom element and renders
 * it's contents by using the custom element factories.
 */
@LunaService({
    name: 'ElementRenderer'
})
export default class ElementRenderer {
    async createElementFactory({ component, attributes = {}, request, response }) {
        // "Inject" the current request and response into the $$luna meta
        // object of the element instance. This allows us to use decorated
        // class members to load the current request and response objects.
        component.element.prototype.$$luna = {
            ...(component.element.prototype?.$$luna ?? {}),
            request,
            response,
        };

        const factory = new (component.ElementFactory)({
            component,
            attributes,
            request,
            response
        });

        await factory.build();

        return factory;
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
        const factory = await this.createElementFactory({
            component, attributes, group, request, response,
        });

        const template = await factory.template();
        const markup = await component.ElementFactory.renderer().renderToString(template, { factory });

        const finalAttributes = await factory.mirrorPropertiesToAttributes();

        return {
            markup,
            element: factory.element,
            finalAttributes,
        };
    };
}
