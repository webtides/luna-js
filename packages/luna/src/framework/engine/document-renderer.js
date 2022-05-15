import {getSerializableConfig, getSettings, getManifest} from "../config";

import posthtml from 'posthtml';
import posthtmlInsertAt from 'posthtml-insert-at';

import {Inject} from "../../decorators/service";
import ComponentLoader from "../loaders/component-loader";
import ElementRenderer from "./element-renderer";

import ssr from './plugins/posthtml-plugin-custom-elements';
import {Component} from "../../decorators/component";
import ElementFactory from "./element-factory";

export default class DocumentRenderer {
    @Inject(ComponentLoader) componentLoader;
    @Inject(ElementRenderer) elementRenderer;

    upgradedElements = {};

    constructor({ request, response }) {
        this.request = request;
        this.response = response;
    }

    async addDependenciesToUpgradedElements(dependencies) {
        dependencies = [ dependencies ].flat();

        for (const dependency of dependencies) {
            if (!this.upgradedElements[dependency]) {
                const component = await this.componentLoader.loadSingleComponentByTagName(dependency);

                if (!component) {
                    continue;
                }

                await this.addDependenciesToUpgradedElements(component.children);
                this.upgradedElements[dependency] = component;
            }
        }
    }

    /**
     * Takes a html-node and tries to match it with a custom element.
     * Recursively renders & upgrades all child elements.
     *
     * @param node
     *
     * @returns {Promise<boolean|{component: ({file: string, relativePath: string, name: *, element: *}|boolean), innerHTML: (jQuery|string), attributes: (*|{})}>}
     */
    async onCustomElementDomNode(node) {
        const { tag } = node;
        const component = await this.componentLoader.loadSingleComponentByTagName(tag);

        if (!component) {
            return false;
        }

        const factory = await this.elementRenderer.createElementFactory({
			component,
			attributes: node.attrs ?? {},
			request: this.request,
			response: this.response,
		});

        if (!factory) {
        	return false;
		}

		// Set the final attributes from the render process to the node.
		node.attrs = await factory.loadFinalAttributes();

		if (!(await factory.shouldRender()) ||
			component.element?.$$luna?.target === Component.TARGET_CLIENT) {
			// We did find a component, but the component should not or cannot be rendered
			// on the server.
			return {
				attributes: node.attrs,
				component,
				innerHTML: '',
				noSSR: true,
			};
		}

        const result = await this.elementRenderer.renderComponentUsingFactory({
			factory
        });

        const { markup } = result;

        const innerDocument = await this.renderUsingPostHtml(markup);
        node.content = innerDocument;

        return {
            attributes: node.attrs,
            component,
            innerHTML: innerDocument,
        };
    };

    parseUpgradedElements() {
        const manifest = getManifest("manifest.client.json");
        const config = JSON.stringify(getSerializableConfig());

        const modules = `
            <script type="module">
                ${Object.keys(this.upgradedElements)
                    // Filter out all elements that should not be rendered on the client.
                    .filter(key => {
                        const target = this.upgradedElements[key]?.element?.$$luna?.target ?? Component.TARGET_SERVER;
                        return target !== Component.TARGET_SERVER;
                    })
                    .map(key => {
                        const component = this.upgradedElements[key];
                        const importPath = luna.asset(`${component.outputDirectory}/${manifest[component.relativePath]}`);

                        const elementFactory = new (component.ElementFactory ?? ElementFactory)({
                            component
                        });

                        return elementFactory.define({ importPath });
                    })
                    .join("\n")
                }
            </script>`;

        const scripts = `
            <script type="text/javascript">
                window.lunaConfig = JSON.parse('${config}');
            </script>
            <script type="text/javascript" src="${luna.asset('/luna.js')}"></script>
        `;

        return [ scripts, modules ].join('');
    }

    /**
     * Takes a whole html document and renders all custom elements
     *
     * @param htmlDocument
     * @returns {Promise<string>}
     */
    async render(htmlDocument) {
        const html = await this.renderUsingPostHtml(htmlDocument);

        return (await posthtml([
            posthtmlInsertAt({
                selector: 'html',
                append: this.parseUpgradedElements(),
            })
        ]).process(html)).html;
    }

    async renderUsingPostHtml(htmlDocument) {
        const plugins = [
            ssr({
                request: this.request,
                response: this.response,
                onCustomElementDomNode: async (node) => {
                    const {component} = await this.onCustomElementDomNode(node);

                    if (component) {
                        await this.addDependenciesToUpgradedElements(component.tagName);
                    }

                    return component;
                }
            }),
        ];

        return (await posthtml(plugins).process(htmlDocument)).html;
    }
}
