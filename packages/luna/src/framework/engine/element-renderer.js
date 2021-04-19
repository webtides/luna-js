import {renderToString} from "@popeindustries/lit-html-server";
import {paramCase} from "param-case";
import ServiceDefinitions from "../services";

const getComponentCacheKey = (component, attributes = {}) => {
    return `${component.element.name}.${JSON.stringify(attributes)};`
};

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
const renderComponent = async ({component, attributes = {}, group = 'components', request, response}) => {
    attributes["ssr"] = true;

    const cache = luna.get(ServiceDefinitions.Cache);

    const cachedValue = await cache.get(getComponentCacheKey(component, attributes), group);
    if (cachedValue) {
        return cachedValue;
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

    const markup = await renderToString(element.template());

    const dependencies = typeof element.dependencies === "function" ? element.dependencies() : [];

    if (!dynamicProperties || component.element.dynamicPropertiesCacheable) {
        await cache.set(getComponentCacheKey(component, attributes), {markup, element, dependencies}, group);
    }


    return {markup, element, dependencies};
};

export {renderComponent};
