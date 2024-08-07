import path from 'node:path';
import { loadManifest, loadSettings } from '../config.js';
import { LunaService } from '../../decorators/service.js';
import { parseMiddleware } from '../http/middleware/index.js';

class RoutesLoader {
	/**
	 * Loads the route definition and normalizes it.
	 *
	 * Extracts the middleware, module and page content.
	 *
	 * @param file string   The path to the page that should be loaded.
	 * @param settings *    The page settings loaded from the manifest
	 *
	 * @returns {Promise<{layout: *, module: *, page: *, middleware: *}>}
	 */
	async loadRouteDefinition({ file, settings }) {
		const module = await import(path.resolve(file));

		const isComponentRoute = module?.default?.prototype?.constructor?.toString().indexOf('class') === 0;

		const ElementFactory = settings?.factory
			? (await import(settings.factory)).ElementFactory
			: await luna.getDefaultElementFactory();

		let staticProperties = {};
		if (isComponentRoute) {
			staticProperties =
				typeof module?.default?.loadStaticProperties === 'function'
					? (await module.default.loadStaticProperties()) ?? {}
					: {};
		}

		return {
			middleware: await parseMiddleware({ middleware: module.middleware }),
			layout: module.layout,
			context: module.context,
			methods: {
				get: module.get ?? module.default,
				post: module.post ?? module.default,
				put: module.put,
				delete: module.remove,
			},
			staticProperties,
			isComponentRoute,
			ElementFactory,
		};
	}

	async loadRoutes() {
		const settings = await loadSettings();
		const manifest = await loadManifest();

		const basePath = settings._generated.applicationDirectory;

		const routes = [...manifest.apis, ...manifest.pages];

		return routes
			.sort((routeA, routeB) => {
				if (routeA.fallback && routeB.fallback) {
					return 0;
				}

				if (!routeA.fallback && !routeB.fallback) {
					return 0;
				}

				return routeA.fallback && !routeB.fallback ? 1 : -1;
			})
			.map((route) => {
				const { file, route: pathname, settings } = route;
				return {
					file: path.join(basePath, file),
					pathname,
					settings,
				};
			});
	}
}

export default LunaService({ name: 'RoutesLoader' })(RoutesLoader);
