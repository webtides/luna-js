import ComponentLoader from "../../loaders/component-loader.js";
import ElementRenderer from "../../engine/element-renderer.js";

/**
 * Checks if a components has sent an async request to call a method
 * in the server context.
 */
export const serverMethodMiddleware = () => async (request, response, next) => {
	const serverMethodId = request.get('x-server-method-id');

	try {
		if (serverMethodId) {
			const { context, args } = request.body;

			const [ tagName, methodName ] = serverMethodId.split('.');

			const componentLoader = luna.get(ComponentLoader);
			const elementRenderer = luna.get(ElementRenderer);
			const component = await componentLoader.loadSingleComponentByTagName(tagName);

			const { element } = await elementRenderer.createElementFactory({
				component, attributes: { }, request, response
			});

			Object.entries(context).forEach(([ property, value ]) => {
				element[property] = value;
			});

			if (!(component.element?.$$luna?.serverMethods ?? []).includes(methodName)) {
				return response.status(400).send('Method does not exist.')
			}

			const result = await response.json(await element[methodName](...args));
			return result;
		}
	} catch (error) {
		console.error(error);
		return response.status(500);
	}

	next();
};
