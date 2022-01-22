import './bootstrap.js';

import {loadSettings} from "./config";
import {callHook} from "./hooks";
import {HOOKS} from "./hooks/definitions";

import ComponentLoader from "./loaders/component-loader";
import Server from "./http/server";
import LunaContainer from "./luna";
import LayoutsLoader from "./loaders/layouts-loader";

/**
 * This methods should be called before anything else.
 * Performs checks for required files and loads the settings.
 *
 * @returns {Promise<boolean>}
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

    return true;
};

const startLuna = async ({ config } = {}) => {
    global.luna = undefined;

    if (!(await prepareLuna({ config }))) {
        console.log("Could not start luna-js. Have you created your luna.config.js?");
        return;
    }

    await global.luna.initialize();

    await callHook(HOOKS.HOOKS_LOADED);

    const componentLoader = luna.get(ComponentLoader);
    await componentLoader.registerAvailableComponents();

    await callHook(HOOKS.COMPONENTS_LOADED, {
        components: componentLoader.getAvailableComponents()
    });

    const layoutsLoader = luna.get(LayoutsLoader);
    await layoutsLoader.registerAvailableLayouts();

    const server = luna.get(Server);
    await server.start();
};

const stopLuna = async () => {
    const server = luna.get(Server);
    await server.stop();
}

export { prepareLuna, startLuna, stopLuna };
