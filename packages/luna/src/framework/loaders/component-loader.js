import {loadManifest, loadSettings} from "../config.js";
import path from "path";
import {paramCase} from "param-case";

export default class ComponentLoader {
    allAvailableComponents = {};

    /**
     * Checks whether or not the element is dynamic. This does it by checking
     * if the `loadDynamicProperties` method exists on the element prototype.
     *
     * @param element LunaElement   The {@link LunaElement} that should be checked.
     *
     * @returns {boolean}
     */
    isDynamicElement(element) {
        const instance = new element();
        const availableProperties = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));

        return availableProperties.includes("loadDynamicProperties");
    }

    /**
     * Checks if an element has static properties and loads them if it has.
     *
     * @param element LunaElement   The {@link LunaElement} from which the static properties should be loaded.
     *
     * @returns {Promise<{}|undefined>} The loaded static properties, or undefined if no properties have been loaded.
     */
    async loadStaticProperties(element) {
        if (!element.disableSSR && typeof element.loadStaticProperties === "function") {
            const staticProperties = await element.loadStaticProperties();

            if (staticProperties) {
                return staticProperties;
            }
        }

        return undefined;
    }

    /**
     * Loads all available components from the generated manifest, loads the
     * metadata for the component and the static properties.
     *
     * @returns {Promise<{
     *  element: LunaElement,
     *  tagName: string,
     *  hasStaticProperties: boolean,
     *  hasDynamicProperties: boolean,
     *  name: string,
     *  file: string,
     *  relativePath: string,
     *  directory: string,
     *  outputDirectory: string,
     *  children: []
     * }[]>}
     */
    async registerAvailableComponents() {
        const settings = await loadSettings();
        const manifest = await loadManifest();

        const basePath = settings._generated.applicationDirectory;

        for (const component of manifest.components) {
            const {file, directory, relativePath, settings, children} = component;
            const absolutePath = path.join(basePath, file);

            const element = require(path.resolve(absolutePath));

            if (typeof element?.prototype?.connectedCallback === "undefined") {
                return;
            }

            element.staticProperties = await this.loadStaticProperties(element);

            const hasDynamicProperties = this.isDynamicElement(element);
            const tagName = paramCase(element.name);

            console.log("Register component", tagName);

            this.allAvailableComponents[tagName] = {
                element,
                tagName,
                hasStaticProperties: typeof element.staticProperties !== "undefined",
                hasDynamicProperties,
                name: element.name,
                file,
                relativePath,
                directory,
                outputDirectory: settings.outputDirectory,
                children
            }
        }

        return this.allAvailableComponents;
    }

    /**
     * Searches inside the available components for a component with the tagName and
     * returns it if it exists.
     *
     * @param tagName string
     *
     * @returns {Promise<boolean|{
     *  element: LunaElement,
     *  tagName: string,
     *  hasStaticProperties: boolean,
     *  hasDynamicProperties: boolean,
     *  name: string,
     *  file: string,
     *  relativePath: string,
     *  directory: string,
     *  outputDirectory: string,
     *  children: []
     * }>}
     */
    async loadSingleComponentByTagName(tagName) {
        tagName = tagName.toLowerCase();

        const components = this.allAvailableComponents;

        if (components[tagName]) {
            return components[tagName];
        }

        return false;
    }

    getAvailableComponents() {
        return this.allAvailableComponents;
    }
}
