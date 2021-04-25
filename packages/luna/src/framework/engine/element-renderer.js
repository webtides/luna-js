import {paramCase} from "param-case";
import {Inject, LunaService} from "../../decorators/service";
import LunaCache from "../cache/luna-cache";
import Renderer from "./renderer";

@LunaService({
    name: 'ElementRenderer'
})
export default class ElementRenderer {
    @Inject(LunaCache) cache;
    @Inject(Renderer) renderer;

    getComponentCacheKey(component, attributes = {}) {
        return `${component.element.name}.${JSON.stringify(attributes)};`
    }

    async createElementFromComponent({ component, attributes = {}, group = 'components', request, response }) {
        attributes["ssr"] = true;

        const cachedValue = await this.cache.get(this.getComponentCacheKey(component, attributes), group);
        if (cachedValue) {
            // return cachedValue;
        }

        const element = new (component.element)();

        // Here we are defining the standard properties.
        element.defineProperties();

        // Then we are defining the attributes from the element as properties.
        Object.keys(attributes).forEach(key => {
            let attributeToDefine = attributes[key];
            try {
                attributeToDefine = JSON.parse(attributes[key]);
            } catch {
            }

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

        return { element, dynamicProperties };
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
        const { element, dynamicProperties } = await this.createElementFromComponent(
            { component, attributes, group, request, response }
        );

        const markup = await this.renderer.render(element.template());

        const dependencies = typeof element.dependencies === "function" ? element.dependencies() : [];

        if (!dynamicProperties || component.element.dynamicPropertiesCacheable) {
            // await this.cache.set(this.getComponentCacheKey(component, attributes), {markup, element, dependencies}, group);
        }


        return {markup, element, dependencies};
    };
}
