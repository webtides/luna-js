import {LunaService} from "../../decorators/service";

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

        if (!component.ElementFactory) {
            console.error(`The component with the tag name "${component.tagName}" has no ElementFactory`);
            return false;
        }

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
     * @param factory		ElementFactory
     *
     * @returns {Promise<{markup: string, element: *}>|Promise<boolean>}
     */
    async renderComponent({ factory }) {
        const template = await factory.template();
        const markup = await factory.component.ElementFactory.renderer().renderToString(template, { factory });

        return {
            markup,
            element: factory.element,
        };
    };
}
