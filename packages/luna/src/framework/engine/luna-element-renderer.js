import {paramCase} from "param-case";
import {render, ElementRenderer} from "@webtides/luna-renderer";
import ComponentLoader from "../loaders/component-loader";
import {Inject} from "../../decorators/service";

const createElementRenderer =  function({request, response}) {

    return class LunaElementRenderer extends ElementRenderer {
        @Inject(ComponentLoader) componentLoader;

        element;

        static matchesClass(ctor) {
            return typeof ctor.loadStaticProperties !== 'undefined';
        }

        constructor(tagName) {
            super(tagName);

            this.component = this.componentLoader.loadSingleComponentByTagName(tagName);
            this.element = new (this.component.element)();
        }

        async connectedCallback() {
            const attributes = {};

            // Here we are defining the standard properties.
            this.element.defineProperties();

            // Then we are defining the attributes from the this.element as properties.
            Object.keys(attributes).forEach(key => {
                let attributeToDefine = attributes[key];
                try {
                    attributeToDefine = JSON.parse(attributes[key]);
                } catch {
                }

                this.element.defineProperty(paramCase(key), attributeToDefine);
            });

            const dynamicProperties = await this.element.loadDynamicProperties({request, response});

            const properties = {
                // ...(component.element.staticProperties ?? {}),
                ...(dynamicProperties ? dynamicProperties : {})
            };

            // At last we are defining external properties.
            Object.keys(properties).forEach(key => {
                this.element.defineProperty(key, properties[key]);
            });

            // Write the element properties back to attributes.
            Object.keys(this.element.properties()).forEach(key => {
                if (typeof properties[key] === "undefined") {
                    return;
                }

                attributes[paramCase(key)] = typeof properties[key] === "string" ? properties[key] : JSON.stringify(properties[key]);
            });
        }

        attributeChangedCallback(name, _old, value) {
            let attributeToDefine = value;
            try {
                attributeToDefine = JSON.parse(value);
            } catch {
            }

            this.element.defineProperty(paramCase(name), attributeToDefine);
        }

        *renderLight(renderInfo) {
            yield* render(this.element.template());
        }

        *renderShadow(renderInfo) {
            yield* render(this.element.template());
        }
    }
};

export { createElementRenderer };
