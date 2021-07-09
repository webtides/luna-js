import {loadManifest, loadSettings} from "../config.js";
import path from "path";
import {paramCase} from "param-case";
import {LunaService} from "../../decorators/service";

@LunaService({
    name: 'ComponentLoader'
})
export default class ComponentLoader {
    allAvailableComponents = {};

    findAppropriateElementFactory(component) {
        const { elementFactories } = luna;

        for (let i = 0; i < elementFactories.length; i++) {
            const { match, factory } = elementFactories[i];

            if (match(component)) {
                return factory;
            }
        }

        // Return the first factory as default.
        return elementFactories[0].factory;
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
            const {file, directory, relativePath, settings, children} = componentModule;
            const absolutePath = path.join(basePath, file);

            const element = require(path.resolve(absolutePath));

            if (!element.$$luna) {
                // The element hasn't been decorated, set some sensible defaults.
                element.$$luna = {
                    ssr: true,
                    csr: false,
                };
            }

            element.staticProperties = element?.$$luna?.ssr && typeof element.loadStaticProperties === 'function'
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
                directory,
                outputDirectory: settings.outputDirectory,
                children
            };

            // Load the appropriate element factory for a component once at startup.
            component.ElementFactory = this.findAppropriateElementFactory(component);

            this.allAvailableComponents[tagName] = component;
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
