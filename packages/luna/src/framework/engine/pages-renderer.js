import { InlineInject, LunaService } from '../../decorators/service.js';
import ElementRenderer from './element-renderer.js';
import ComponentLoader from '../loaders/component-loader.js';
import LayoutsLoader from '../loaders/layouts-loader.js';

class PagesRenderer {
	constructor() {
		this.componentLoader = InlineInject(ComponentLoader);
		this.layoutsLoader = InlineInject(LayoutsLoader);
		this.elementRenderer = InlineInject(ElementRenderer);
	}

	/**
	 * Takes a page and a layout factory and wraps the pages
	 * with the layout.
	 *
	 * Replaces the ${page} variable inside the layout.
	 *
	 * @param factory (page) => *   	The layout factory which should be used
	 * @param page *                	The html page fragment.
	 * @param context {{}}          	The context to be passed into the layout.
	 * @param request *					The current request object
	 * @param response *				The current response
	 * @param container	ServiceContext	The luna service container.
	 *
	 * @returns {Promise<string>}
	 */
	async applyLayout(factory, page, context, { request, response, container }) {
		const factoryResult = await factory(page, context, { request, response, container });
		return `${factoryResult}`;
	}

	/**
	 * Loads the content of an anonymous page. Anonymous pages cannot be dynamic, so
	 * they can be cached.
	 *
	 * @param module {{layout: *, module: *, page: *, middleware: *}}   The page module loaded by {@link loadPageDefinition}
	 * @param request *     The express request object
	 * @param response *    The express response object.
	 * @param container ServiceContext
	 *
	 * @returns {Promise<{markup: string, layoutFactory: *, element: *}|boolean>}
	 */
	async renderAnonymousPage({ definition, request, response, container }) {
		const { page } = definition;

		if (typeof page !== 'function') {
			throw new Error('pageNotInvokable');
		}

		const layoutName = typeof definition?.layout === 'function' ? definition.layout() : 'default';

		const context = typeof definition?.context === 'function' ? await definition.context() : {};

		return {
			markup: await page({ request, response, container }),
			layout: this.layoutsLoader.getLayoutByName(layoutName),
			context,
		};
	}

	async renderComponentPage({ definition, request, response }) {
		// Convert the page module to a component so that we can use the
		// element renderer.
		const componentData = {
			component: {
				element: definition.page,
				ElementFactory: definition.ElementFactory,
			},
			attributes: {},
			group: 'pages',
			request,
			response,
		};

		const { markup, element } = await this.elementRenderer.renderComponent(componentData);

		const layoutName =
			element && typeof element.layout === 'function' ? element.layout() : element?.layout ?? 'default';

		return {
			markup,
			layout: this.layoutsLoader.getLayoutByName(layoutName),
			context: element,
		};
	}

	/**
	 * Takes a loaded page module and generates the markup. Checks if the page is an anonymous
	 * page or a component page and uses {@link renderAnonymousPage} to
	 * generate the markup.
	 *
	 * @param definition {{layout: *, module: *, page: *, middleware: *}}   The page definition loaded by {@link loadPageDefinition}
	 * @param request *                                                 	The express request object
	 * @param response *                                                	The express response object.
	 * @param container {ServiceContext}
	 *
	 * @returns {Promise<string|boolean>}   The complete markup as a string.
	 */
	async generatePageMarkup({ definition, request, response, container }) {
		const pageData = { definition, request, response, container };

		const result = definition.isComponentRoute
			? await this.renderComponentPage(pageData)
			: await this.renderAnonymousPage(pageData);

		if (!result) {
			return false;
		}

		if (typeof result.markup !== 'string') {
			return result.markup;
		}

		return this.applyLayout(result.layout, result.markup, result.context, { request, response, container });
	}
}

export default LunaService({ name: 'PagesRenderer' })(PagesRenderer);
