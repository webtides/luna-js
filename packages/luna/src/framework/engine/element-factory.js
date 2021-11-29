import {paramCase} from "param-case";
import {camelCase} from "camel-case";

import TemplateRenderer from "./template-renderer";

/**
 * The base ElementFactory class. Provides some utility methods and is meant to be overridden by
 * more specialized element factories.
 */
export default class ElementFactory {
    /**
     *
     * @returns {TemplateRenderer}  The renderer which should be used to
     *                              render the elements.
     */
    static renderer() {
        return new TemplateRenderer();
    }

    /**
     * The properties the element itself has defined.
     *
     * @type {{}}
     */
    properties = {};

    /**
     *
     * @type {*}    The element which is currently being built.
     */
    element = null;

    /**
     *
     * @param component     The component which includes the element class to be initialized.
     * @param attributes    The attributes that are already written on the element.
     * @param request       The current express request object
     * @param response      The current express response object
     */
    constructor({ component, attributes, request, response }) {
        this.component = component;
        this.attributes = attributes ?? {};
        this.request = request;
        this.response = response;
    }

    async buildElement() {
        return new (this.component.element)(this.attributes);
    }

    async template() {
        return this.element.template;
    }

    define({ importPath }) {
        return `
            import ${this.component.name} from "${importPath}";
            customElements.define("${this.component.tagName}", ${this.component.name});
        `;
    }

    async getInitialProperties() {
        return {};
    }

    /**
     * These are the properties which should be serialized and mirrored back to the
     * attributes so that they can be passed to the client.
     *
     * @returns {Promise<{}>}
     */
    async getPropertiesToSerialize() {
        return {
            ...(await this.getInitialProperties()),
        };
    }

    async getStaticProperties() {
        return this.component.element.staticProperties ?? {}
    }

    async getDynamicProperties() {
        return typeof this.element.loadDynamicProperties === 'function'
            ? await this.element.loadDynamicProperties({
                request: this.request,
                response: this.response,
            })
            : {};
    }

    /**
     * Creates a new instance of the element and takes all attributes that are defined on the corresponding
     * DOM node and maps them to properties on the element.
     *
     * @returns {Promise<void>}
     */
    async build() {
        this.element = await this.buildElement();
        await this.mirrorAttributesToProperties();
    }

    async mirrorPropertiesToAttributes() {
        const initialProperties = await this.getInitialProperties();
        const dynamicProperties = await this.getDynamicProperties();
        const staticProperties = await this.getStaticProperties();

        const propertiesToSerialize = await this.getPropertiesToSerialize();

        const properties = {};
        Object.keys(propertiesToSerialize).forEach(key => {
            properties[key] = dynamicProperties[key]
                ?? staticProperties[key]
                ?? this.element[key]
                ?? initialProperties[key]
                ?? propertiesToSerialize[key];
        });

        const finalAttributes = {
            ...this.attributes,
            ...(this.parsePropertiesToAttributes(properties)),
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

    async mirrorAttributesToProperties() {
        // These are the properties that need to be defined on the element to
        // calculate the initial state.
        const properties = {
            // First we are defining the initial (default) properties on the element
            ...(await this.getInitialProperties()),
            // Then we are defining static properties which were loaded at luna startup.
            ...(await this.getStaticProperties()),
            // Then we take the attributes that are written on the current element instance.
            // and mirror them to attributes.
            ...(this.parseAttributesToProperties(this.attributes)),
        };

        Object.keys(properties).forEach((key) => {
            this.element[key] = properties[key];
        });

        // At last we are loading the dynamic properties from the element.

        const dynamicProperties = await this.getDynamicProperties();
        Object.keys(dynamicProperties).forEach((key) => {
            this.element[key] = dynamicProperties[key];
        });
    }

    parsePropertiesToAttributes(properties) {
        const attributes = {};
        Object.keys(properties).forEach(key => {
            attributes[paramCase(key)] = properties[key];
        });
        return attributes;
    }

    parseAttributesToProperties(attributes) {
        const properties = {};

        Object.keys(attributes).forEach(key => {
            let attributeToDefine = attributes[key];

            try {
                attributeToDefine = JSON.parse(attributes[key]);
            } catch {}

            properties[camelCase(key)] = attributeToDefine;
        });

        return properties;
    }
}
