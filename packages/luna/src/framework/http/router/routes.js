import DocumentRenderer from "../../engine/document-renderer";
import ServiceContext from "../../services/service-context";
import PagesRenderer from "../../engine/pages-renderer";
import RoutesLoader from "../../loaders/routes-loader.js";

let currentRouter;

const invokeRoute = async ({routeDefinition, request, response}) => {
	const callback = routeDefinition.methods[request.method.toLowerCase()];

	if (!callback) {
		return response.status(404).send();
	}

	const container = new ServiceContext({
		$$luna: {
			request,
			response
		}
	});

	// The callback result could be either
	//	1. a string for anonymous page routes
	//	2. an object for any kind of route.
	//	3. a class for component routes
	//	4: undefined for redirects and direct responses from the controller

	const page = await luna.get(PagesRenderer).generatePageMarkup({
		definition: {
			...routeDefinition,
			page: callback,
		},
		request,
		response,
		container,
	});

	if (response.headersSent) {
		// Somewhere in the application the response has already been handled.
		return;
	}

	if (typeof page !== 'string') {
		return response.json(page);
	}

	const documentRenderer = new DocumentRenderer({request, response});
	const html = await documentRenderer.render(page);

	if (response.headersSent) {
		return response.end();
	}

	if (request.$$luna?.isCacheable) {
		request.$$luna.cachedResponse = html;
	}

	return response.send(html);
};

/**
 * The main routing part of our application. All pages
 * and apis are being registered here.
 *
 * @param router                The express app or an express router.
 *
 * @returns {Promise<void>}
 */
const routes = async ({router}) => {
	currentRouter = router;

	const routesLoader = luna.get(RoutesLoader);
	const routes = await routesLoader.loadRoutes();

	for (const {file, pathname, settings} of routes) {
		const routeDefinition = await routesLoader.loadRouteDefinition({
			file, settings,
		});

		router.all(
			pathname,
			routeDefinition.middleware,
			async (request, response) => {
				try {
					await invokeRoute({
						routeDefinition,
						request,
						response,
					});
				} catch (error) {
					console.error(error);
					return response.status(500).send();
				}
			},
		);

		console.log(`Registered route ${pathname}`);
	}
};

export {routes, currentRouter};
