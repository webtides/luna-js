import { getConfigValue, getSettings } from './config.js';
import LunaBase from './shared/luna-base.js';
import HooksLoader from './loaders/hooks-loader.js';
import { callHook } from './hooks/index.js';
import { HOOKS } from './hooks/definitions.js';
import MemoryCache from './cache/memory-cache.js';
import ServiceContainer from './services/service-container.js';
import ComponentLoader from './loaders/component-loader.js';
import ElementRenderer from './engine/element-renderer.js';
import LunaCache from './cache/luna-cache.js';
import Server from './http/server.js';
import ElementFactory from './engine/element-factory.js';
import PagesRenderer from './engine/pages-renderer.js';
import LayoutsLoader from './loaders/layouts-loader.js';
import RoutesLoader from './loaders/routes-loader.js';

/**
 * The luna base class. Also provides a simple service
 * container.
 */
export default class LunaContainer extends LunaBase {
	constructor() {
		super();

		this.serviceDefaults = [
			/* CACHE */
			LunaCache,
			MemoryCache,

			/* LOADERS */
			ComponentLoader,
			HooksLoader,
			LayoutsLoader,
			RoutesLoader,

			/* RENDERERS */
			ElementRenderer,
			PagesRenderer,

			Server,
		];
	}

	prepare() {
		Object.keys(this.serviceDefaults).map((name) => {
			this.set(this.serviceDefaults[name].$$luna.serviceName, new this.serviceDefaults[name]());
		});
	}

	/**
	 * The main initialization method of our luna js framework.
	 *
	 * Does not handle component/route registration.
	 *
	 * @returns {Promise<boolean>}
	 */
	async initialize() {
		await this.get(HooksLoader).loadHooks();
		await callHook(HOOKS.LUNA_INITIALIZE, { luna: global.luna });
	}

	async getDefaultElementFactory() {
		// For pages and layout, we will always use the
		// default element factory, which is just a string.
		return ElementFactory;
	}

	config(key = undefined, defaultValue = false) {
		if (typeof key === 'undefined') {
			return getSettings();
		}

		return getConfigValue(key, defaultValue);
	}

	get(name) {
		return ServiceContainer.get(name);
	}

	set(name, implementation) {
		ServiceContainer.set(name, implementation);
	}
}
