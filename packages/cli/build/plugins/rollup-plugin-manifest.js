import fs from 'fs';
import path from 'path';
import { getEntryType } from './helpers/entries';
import { getConfig } from '../../src/config';

const loadComponentChildren = (contents) => {
	const result = contents.match(/<(?:\w*-\w*)(?:-\w*)*/gm);

	return result
		? result.filter((result) => !!result && result.startsWith('<')).map((result) => result.substring(1))
		: [];
};

const getRouteName = (name) => {
	name = name.replace(/\[(\w*)]/g, ':$1');

	if (name.endsWith('/index')) {
		return name.substring(0, name.length - '/index'.length);
	}

	return name;
};

const isRouteWithParam = (name) => {
	const regex = new RegExp(/(:\w*)/);
	return regex.test(name);
};

const sortRoutes = (routes) => {
	return routes.sort((a, b) => {
		if (a.fallback && !b.fallback) {
			return 1;
		} else if (!a.fallback && b.fallback) {
			return -1;
		}

		if (isRouteWithParam(a.route) && !isRouteWithParam(b.route)) {
			return 1;
		} else if (isRouteWithParam(b.route) && !isRouteWithParam(a.route)) {
			return -1;
		}
		return 0;
	});
};

export const rollupPluginManifest = function (options) {
	const { config } = options;
	const entries = {
		components: {},
		pages: {},
		layouts: {},
		apis: {},
		hooks: {},
	};

	const hasRegisteredEntry = (id) => {
		for (const type of Object.keys(entries)) {
			if (!!entries[type][id]) {
				return true;
			}
		}

		return false;
	};

	return {
		name: 'luna-manifest',
		resolveId(id, importer) {
			// A entry route.
			if (importer === undefined) {
				const lunaSettings = getConfig().settings;

				const entryType = getEntryType(id, config);

				if (entryType === null) {
					return null;
				}

				const { type, basePath, settings } = entryType;

				const relativePath = id.substring(basePath.length);
				const relativeBasePath = basePath.substring(process.cwd().length);

				const entry = {
					relativePath,
					file: null,
					settings,
					basePath: relativeBasePath.split('\\').join('/'),
				};

				if (type === 'layouts') {
					entry.name = relativePath.split('.js')[0].substring(1);
				}

				if (type === 'apis' || type === 'pages') {
					const fallbackRoute = lunaSettings.pages?.fallback ?? false;
					const fallbackApiRoute = lunaSettings.api?.fallback ?? false;

					const { context } = type === 'apis' ? lunaSettings.api : lunaSettings.pages;
					let route = getRouteName(relativePath.split('.js')[0]);

					if (
						(type === 'apis' && route === fallbackApiRoute) ||
						(type === 'pages' && route === fallbackRoute)
					) {
						entry.route = `${context ?? ''}/*`;
						entry.fallback = true;
					} else {
						entry.route = `${context ?? ''}${route}`;
					}
				}

				entries[type][path.resolve(id)] = entry;
			}

			return null;
		},

		async renderChunk(code, chunk, options) {
			if (chunk.facadeModuleId !== null && hasRegisteredEntry(path.resolve(chunk.facadeModuleId))) {
				const type = getEntryType(chunk.facadeModuleId, config).type;
				entries[type][path.resolve(chunk.facadeModuleId)].file = chunk.fileName;

				if (type === 'components') {
					entries[type][path.resolve(chunk.facadeModuleId)].children = loadComponentChildren(code);
				}
			}

			return null;
		},

		generateBundle() {
			const { settings } = getConfig();

			const { manifest } = settings._generated;

			const directory = path.dirname(manifest);
			if (!fs.existsSync(directory)) {
				fs.mkdirSync(directory, { recursive: true });
			}

			const manifestData = {};

			Object.keys(entries).forEach((type) => {
				manifestData[type] = Object.keys(entries[type]).map((key) => entries[type][key]);
			});

			manifestData['pages'] = sortRoutes(manifestData['pages']);
			manifestData['apis'] = sortRoutes(manifestData['apis']);

			manifestData['settings'] = {
				port: settings.port,
				build: settings.build,
				routes: settings.routes,
				cache: settings.cache,
				export: settings.export,
				assets: {
					domain: settings.assets.domain,
					context: settings.assets.context,
				},
				api: {
					domain: settings.api.domain,
					context: settings.api.context,
				},
				_generated: settings._generated,
			};

			fs.writeFileSync(manifest, JSON.stringify(manifestData), { encoding: 'utf-8' });
		},
	};
};
