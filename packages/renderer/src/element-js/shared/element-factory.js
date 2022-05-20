import BaseElementFactory from "@webtides/luna-js/src/framework/engine/element-factory";
import {Component} from "@webtides/luna-js";

export default (templateRenderer) => {
    /**
     * The element factory to render the TemplateElement from
     * "@webtides/element-js" on the server.
     *
     * Takes the component and renders the element from the available data.
     */
    return class ElementFactory extends BaseElementFactory {

        static renderer() {
            return new templateRenderer();
        }

        async getAdditionalAttributes() {
            const additionalAttributes = {
                ...(await super.getAdditionalAttributes()),
            };

            if (this.component?.element?.$$luna?.target !== Component.TARGET_CLIENT) {
            	additionalAttributes['defer-update'] = true;
			}

            return additionalAttributes;
        }

        modifyAttributeBeforeFinalization(attributeName, attributeValue) {
            if (attributeValue === true || attributeValue === false) {
                attributeValue = `${attributeValue}`;
            }

            return super.modifyAttributeBeforeFinalization(attributeName, attributeValue);
        }

        async shouldRender() {
            return typeof this.element.template === 'function';
        }

        async template() {
            return this.element.template();
        }
    }
};
