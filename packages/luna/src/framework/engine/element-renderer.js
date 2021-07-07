import {Inject, LunaService} from "../../decorators/service";
import ElementFactory from "./element-factory";
import TemplateRenderer from "./template-renderer";

@LunaService({
    name: 'ElementRenderer'
})
export default class ElementRenderer {
    @Inject(TemplateRenderer) templateRenderer;
    @Inject(ElementFactory) elementFactory;

    async buildElement({ component, attributes = {}, group = 'components', request, response }) {
        // Create an instance of a dynamic element factory class which can be overridden by the developer.
        const result = await this.elementFactory.buildElement({ component, attributes, request, response });

        // Inject the current luna instance into the element.
        if (!result.element) {
            throw new Error('The "ElementFactory" needs to at least return an element to inject the current request.')
        }

        result.element.$$luna = {
            ...(result.element.$$luna ?? {}),
            request,
            response,
        };

        return result;
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
        const result = await this.buildElement({
            component, attributes, group, request, response,
        });

        const template = await this.elementFactory.template(result);
        const markup = await this.templateRenderer.renderToString(template);

        return {markup, element: result.element};
    };
}
