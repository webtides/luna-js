import {loadFromCache, writeToCache} from "../cache/cache";
import {html, renderToString} from "@popeindustries/lit-html-server";
import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";
import {paramCase} from "param-case";

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
 * @param onElementLoaded
 *
 * @returns {Promise<{markup: string, element: *}>}
 */
const renderComponent = async ({component, attributes = {}, request, response}) => {
    const cachedValue = await loadFromCache(getComponentCacheKey(component, attributes), "components");
    if (cachedValue) {
        return cachedValue;
    }

    attributes["ssr"] = true;

    const element = new (component.element)();

    // Here we are defining the standard properties.
    element.defineProperties();

    // Then we are defining the attributes from the element as properties.
    Object.keys(attributes).forEach(key => {
        let attributeToDefine = attributes[key];
        try {
            attributeToDefine = JSON.parse(attributes[key]);
        } catch { }

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
        attributes[paramCase(key)] = typeof properties[key] === "string" ? properties[key] : JSON.stringify(properties[key]);
    });

    const markup = await renderToString(element.template({html, unsafeHTML}));

    if (!dynamicProperties || component.element.dynamicPropertiesCacheable) {
        await writeToCache(getComponentCacheKey(component, attributes), {markup, element}, "components");
    }

    return {markup, element};
};

export { renderComponent };
