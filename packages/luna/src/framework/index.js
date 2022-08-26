import './bootstrap.js';

import { loadSettings } from './config.js';
import { callHook } from './hooks/index.js';
import { HOOKS } from './hooks/definitions.js';

import ComponentLoader from './loaders/component-loader.js';
import Server from './http/server.js';
import LunaContainer from './luna.js';
import LayoutsLoader from './loaders/layouts-loader.js';

/**
 * This methods should be called before anything else.
 * Performs checks for required files and loads the settings.
 *
 * @returns {Promise<boolean|Server>}
 */
const prepareLuna = async ({ config } = {}) => {
	// First we load all settings.
	if (!(await loadSettings({ config }))) {
		return false;
	}

	// Only initialize luna once.
	if (!global.luna) {
		const luna = new LunaContainer(loadSettings());
		luna.prepare();

		global.luna = luna;
	}

	await global.luna.initialize();

	await callHook(HOOKS.HOOKS_LOADED);

	const componentLoader = global.luna.get(ComponentLoader);
	await componentLoader.registerAvailableComponents();

	await callHook(HOOKS.COMPONENTS_LOADED, {
		components: componentLoader.getAvailableComponents(),
	});

	const layoutsLoader = global.luna.get(LayoutsLoader);
	await layoutsLoader.registerAvailableLayouts();

	return global.luna.get(Server);
};

const startLuna = async ({ config } = {}) => {
	global.luna = undefined;

	const server = await prepareLuna({ config });
	if (!server) {
		console.log('Could not start luna-js. Have you created your luna.config.js?');
		return;
	}

	await server.start();
	return server;
};

const stopLuna = async () => {
	const server = luna.get(Server);
	await server.stop();
};

export { prepareLuna, startLuna, stopLuna };
