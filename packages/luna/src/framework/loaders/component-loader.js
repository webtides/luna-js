import path from "path";

import {paramCase} from "param-case";

import {loadManifest, loadSettings} from "../config.js";
import {LunaService} from "../../decorators/service";
import {Component} from "../../decorators/component";
import {importDynamically} from "../helpers/dynamic-import";

@LunaService({
    name: 'ComponentLoader'
})
export default class ComponentLoader {
    allAvailableComponents = {};

    async loadSingleComponent({absolutePath, file, relativePath, children, settings }) {
        const importedElement = await import(path.resolve(absolutePath));
        // Only use the default export if available. Then we can export more from the file than
        // just the element.
        const element = importedElement.default ?? importedElement;

        if (!element.$$luna) {
            // The element hasn't been decorated, set some sensible defaults.
            element.$$luna = {
                target: settings.defaultTarget ?? Component.TARGET_SERVER,
            };
        }

        // Don't load static properties if the element should only be loaded in the client
        element.staticProperties = (element?.$$luna?.target !== Component.TARGET_CLIENT)
            && typeof element.loadStaticProperties === 'function'
                ? (await element.loadStaticProperties()) ?? {}
                : {};

        const tagName = element.$$luna?.selector ?? paramCase(element.name);

        console.log("Register component", tagName);

        const component = {
            element,
            tagName,
            name: element.name,
            file,
            relativePath,
            outputDirectory: settings.outputDirectory,
            children
        };

        // Load the appropriate element factory for a component once at startup.
        component.ElementFactory = settings.factory
            ? (await importDynamically(settings.factory)).ElementFactory
            : await luna.getDefaultElementFactory();

        return component;
    }

    /**
     * Loads all available components from the generated manifest, loads the
     * metadata for the component and the static properties.
     *
     * @returns {Promise<*>}
     */
    async registerAvailableComponents() {
        const settings = await loadSettings();
        const manifest = await loadManifest();

        const basePath = settings._generated.applicationDirectory;

        for (const componentModule of manifest.components) {
            const {file, relativePath, settings, children} = componentModule;
            const absolutePath = path.join(basePath, file);

            const component = await this.loadSingleComponent({
                absolutePath, file, relativePath, settings, children
            });

            this.allAvailableComponents[component.tagName] = component;
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
