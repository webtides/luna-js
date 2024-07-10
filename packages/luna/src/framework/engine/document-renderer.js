import { getSerializableConfig, getSettings, getManifest } from '../config.js';

import posthtml from 'posthtml';
import { insertAt as posthtmlInsertAt} from 'posthtml-insert-at';

import ComponentLoader from '../loaders/component-loader.js';
import ElementRenderer from './element-renderer.js';

import ssr from './plugins/posthtml-plugin-custom-elements.js';
import { Component } from '../../decorators/component.js';
import ElementFactory from './element-factory.js';

export default class DocumentRenderer {
	constructor({ request, response }) {
		this.upgradedElements = {};

		this.request = request;
		this.response = response;
	}

	async addDependenciesToUpgradedElements(dependencies) {
		dependencies = [dependencies].flat();

		for (const dependency of dependencies) {
			if (!this.upgradedElements[dependency]) {
				if (!dependency) {
					continue;
				}

				const component = await luna.get(ComponentLoader).loadSingleComponentByTagName(dependency);

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
		const component = await luna.get(ComponentLoader).loadSingleComponentByTagName(tag);

		if (!component) {
			return false;
		}

		const factory = await luna.get(ElementRenderer).createElementFactory({
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

		if (!(await factory.shouldRender()) || component.element?.$$luna?.target === Component.TARGET_CLIENT) {
			// We did find a component, but the component should not or cannot be rendered
			// on the server.
			return {
				attributes: node.attrs,
				component,
				innerHTML: '',
				noSSR: true,
			};
		}

		const result = await luna.get(ElementRenderer).renderComponentUsingFactory({
			factory,
		});

		const { markup } = result;

		const innerDocument = await this.renderUsingPostHtml(markup);
		node.content = innerDocument;

		return {
			attributes: node.attrs,
			component,
			innerHTML: innerDocument,
		};
	}

	parseUpgradedElements() {
		const manifest = getManifest('manifest.client.json');
		const config = JSON.stringify(getSerializableConfig());

		const modules = `
            <script type="module">
                ${Object.keys(this.upgradedElements)
					// Filter out all elements that should not be rendered on the client.
					.filter((key) => {
						const target = this.upgradedElements[key]?.element?.$$luna?.target ?? Component.TARGET_SERVER;
						return target !== Component.TARGET_SERVER;
					})
					.map((key) => {
						const component = this.upgradedElements[key];
						const importPath = luna.asset(
							`${component.outputDirectory}/${manifest[component.relativePath]}`,
						);

						const elementFactory = new (component.ElementFactory ?? ElementFactory)({
							component,
						});

						return elementFactory.define({ importPath });
					})
					.join('\n')}
            </script>`;

		const scripts = `
            <script type="text/javascript">
                window.lunaConfig = JSON.parse('${config}');
            </script>
            <script type="text/javascript" src="${luna.asset('/luna.js')}"></script>
        `;

		return [scripts, modules].join('');
	}

	/**
	 * Takes a whole html document and renders all custom elements
	 *
	 * @param htmlDocument
	 * @returns {Promise<string>}
	 */
	async render(htmlDocument) {
		const html = await this.renderUsingPostHtml(htmlDocument);

		return (
			await posthtml([
				posthtmlInsertAt({
					selector: 'html',
					append: this.parseUpgradedElements(),
				}),
			]).process(html)
		).html;
	}

	async renderUsingPostHtml(htmlDocument) {
		const plugins = [
			ssr({
				request: this.request,
				response: this.response,
				onCustomElementDomNode: async (node) => {
					const { component } = await this.onCustomElementDomNode(node);

					if (component) {
						await this.addDependenciesToUpgradedElements(component.tagName);
					}

					return component;
				},
			}),
		];

		return (await posthtml(plugins).process(htmlDocument)).html;
	}
}
