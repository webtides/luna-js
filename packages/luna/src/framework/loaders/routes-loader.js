import path from 'path';
import {loadManifest, loadSettings} from '../config.js';
import {LunaService} from "../../decorators/service.js";
import {importDynamically} from "../helpers/dynamic-import.js";
import {parseMiddleware} from "../http/middleware";

@LunaService({
	name: 'RoutesLoader'
})
export default class RoutesLoader {
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
	async loadRouteDefinition({file, settings}) {
		const module = await import(path.resolve(file));

		const isComponentRoute = module?.default?.prototype?.constructor?.toString().indexOf('class') === 0;

		const ElementFactory = settings?.factory
			? (await importDynamically(settings.factory)).ElementFactory
			: await luna.getDefaultElementFactory();

		let staticProperties = {};
		if (isComponentRoute) {
			staticProperties =  typeof module?.default?.loadStaticProperties === 'function'
				? (await module.default.loadStaticProperties()) ?? {}
				: {};
		}

		return {
			middleware: await parseMiddleware({middleware: module.middleware}),
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
			ElementFactory
		};
	}

    async loadRoutes() {
        const settings = await loadSettings();
        const manifest = await loadManifest();

        const basePath = settings._generated.applicationDirectory;

        const routes = [
			...manifest.pages,
			...manifest.apis,
		];

        return routes.map((route) => {
			const {file, route: pathname, settings } = route;
			return {
				file: path.join(basePath, file), pathname, settings,
			};
		});
    }
}
