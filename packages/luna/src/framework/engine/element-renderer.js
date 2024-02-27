import { LunaService } from '../../decorators/service.js';

/**
 * The element renderer is the "interface" between luna and other custom element factories.
 * It takes a dom node with attributes, builds the corresponding custom element and renders
 * it's contents by using the custom element factories.
 */
class ElementRenderer {
	async createElementFactory({ component, attributes = {}, request, response }) {
		if (!component.ElementFactory) {
			console.error(`The component with the tag name "${component.tagName}" has no ElementFactory`);
			return false;
		}

		const factory = new component.ElementFactory({
			component,
			attributes,
			request,
			response,
		});

		await factory.build();
		return factory;
	}

	/**
	 * Takes a single component object and renders the element.
	 * Fetches all dynamic properties for the component & loads
	 * the static properties.
	 *
	 * @param factory		ElementFactory
	 *
	 * @returns {Promise<{markup: string, element: *}>|Promise<boolean>}
	 */
	async renderComponentUsingFactory({ factory }) {
		const template = await factory.template();
		const markup = await factory.component.ElementFactory.renderer().renderToString(template, { factory });

		return {
			markup,
			element: factory.element,
		};
	}

	/**
	 * Takes a single component object and renders the element.
	 * Fetches all dynamic properties for the component & loads
	 * the static properties.
	 *
	 * @param component ({ element: * })
	 * @param attributes
	 * @param request
	 * @param response
	 * @param group string      The component cache group. Can be used to use different caches for
	 *                          different types of components.
	 *
	 * @returns {Promise<{markup: string, element: *}>|Promise<boolean>}
	 */
	async renderComponent({ component, attributes = {}, group = 'components', request, response }) {
		const factory = await this.createElementFactory({
			component,
			attributes,
			group,
			request,
			response,
		});

		if (!factory || !(await factory.shouldRender())) {
			return false;
		}

		const result = await this.renderComponentUsingFactory({ factory });
		return {
			...result,
			finalAttributes: await factory.loadFinalAttributes(),
		};
	}
}

export default LunaService({ name: 'ElementRenderer' })(ElementRenderer);
