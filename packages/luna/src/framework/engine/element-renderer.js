import {paramCase} from "param-case";
import {Inject, LunaService} from "../../decorators/service";
import LunaCache from "../cache/luna-cache";
import TemplateRenderer from "./template-renderer";

@LunaService({
    name: 'ElementRenderer'
})
export default class ElementRenderer {
    @Inject(LunaCache) cache;
    @Inject(TemplateRenderer) renderer;

    getComponentCacheKey(component, attributes = {}) {
        return `${component.element.name}.${JSON.stringify(attributes)};`
    }

    async buildElement({ component, attributes = {}, group = 'components', request, response }) {
        attributes["ssr"] = true;

        const element = new (component.element)({ request, response });

        // Here we are defining the standard properties.
        element.defineProperties();

        // Then we are defining the attributes from the element as properties.
        Object.keys(attributes).forEach(key => {
            let attributeToDefine = attributes[key];
            try {
                attributeToDefine = JSON.parse(attributes[key]);
            } catch {}

            element.defineProperty(paramCase(key), attributeToDefine);
        });

        const dynamicProperties = await element.loadDynamicProperties({request, response});

        const properties = {
            ...(component.element.staticProperties ?? {}),
            ...(dynamicProperties ? dynamicProperties : {})
        };

        // At last we are defining external properties.
        Object.keys(properties).forEach(key => {
            element.defineProperty(key, properties[key]);
        });

        // Write the element properties back to attributes.
        Object.keys(element.properties()).forEach(key => {
            if (typeof properties[key] === "undefined") {
                return;
            }

            attributes[paramCase(key)] = typeof properties[key] === "string" ? properties[key] : JSON.stringify(properties[key]);
        });

        return {
            element,
            dynamicProperties
        };
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
     * @returns {Promise<{markup: string, element: *, dependencies: []}|boolean>}
     */
    async renderComponent({component, attributes = {}, group = 'components', request, response}) {
        const { element, dynamicProperties } = await this.buildElement({
            component, attributes, group, request, response,
        });

        const markup = await this.renderer.renderToString(element.template());

        const dependencies = typeof element.dependencies === "function" ? element.dependencies() : [];

        if (!dynamicProperties || component.element.dynamicPropertiesCacheable) {
            await this.cache.set(this.getComponentCacheKey(component, attributes), {markup, element, dependencies}, group);
        }

        return {markup, element, dependencies};
    };
}
