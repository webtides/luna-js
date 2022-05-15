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

    async shouldRender() {
        return typeof this.element.template !== 'undefined';
    }

    async template() {
        return typeof this.element.template === 'function' ? this.element.template() : this.element.template;
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

    async getAdditionalAttributes() {
        return {
            'ssr': true,
        };
    }

    /**
     * An array of property names which should be serialized and mirrored
     * back to the client.
     *
     * Any other properties won't be serialized.
     *
     * @returns {Promise<[]>}
     */
    async getPropertiesToSerialize() {
        return [
            // Include the initial properties defined by the customElement.
            // They can vary from element to element.
            ...Object.keys(await this.getInitialProperties()),
            // Include all attributes that have been written on the element instance
            // so that they won't get lost.
            ...Object.keys(this.parseAttributesToProperties(this.attributes))
        ];
    }

    modifyAttributeBeforeFinalization(attributeName, attributeValue) {
        // Allow for "." notation by just removing the "." and parsing the value as json
        if (attributeName.startsWith('.')) {
            attributeName = attributeName.substring(1);
            attributeValue = JSON.stringify(attributeValue);
        }

        return [
            attributeName,
            attributeValue,
        ];
    }

    /**
     * Creates a new instance of the element and takes all attributes that are defined on the corresponding
     * DOM node and maps them to properties on the element.
     *
     * @returns {Promise<boolean|Response>}
     */
    async build() {
        this.element = await this.buildElement();
        await this.loadAndDefineElementProperties();
    }

    async mirrorPropertiesToAttributes() {
        const properties = {};
        (await this.getPropertiesToSerialize()).forEach((propertyKey) => {
            properties[propertyKey] = this.element[propertyKey];
        });
        return this.parsePropertiesToAttributes(properties);
    }

    async loadFinalAttributes() {
        // This object contains all attributes that should be written to the element
        // and have been derived from the properties.
        const finalAttributes = {
            ...(await this.mirrorPropertiesToAttributes()),
            ...(await this.getAdditionalAttributes()),
        };

        return Object.fromEntries(
            Object.entries(finalAttributes).map(([ attributeName, attributeValue ]) => {
                return this.modifyAttributeBeforeFinalization(
                    attributeName,
                    attributeValue,
                );
            })
        );
    }

    async loadAndDefineElementProperties() {
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
        const dynamicProperties = (await this.getDynamicProperties()) ?? {};
        Object.keys(dynamicProperties).forEach((key) => {
            this.element[key] = dynamicProperties[key];
        });
    }

    parsePropertiesToAttributes(properties) {
        const attributes = {};
        Object.keys(properties).forEach(key => {
            attributes[paramCase(key)] = typeof properties[key] !== 'string'
                ? JSON.stringify(properties[key])
                : properties[key];
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
