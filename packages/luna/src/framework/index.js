import dotenv from 'dotenv';
dotenv.config();

import './bootstrap.js';

import {getSerializableConfig, loadSettings} from "./config.js";
import {callHook} from "./hooks/index.js";
import {HOOKS} from "./hooks/definitions.js";

import ComponentLoader from "./loaders/component-loader.js";
import Server from "./http/server.js";
import LunaContainer from "./luna.js";

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
        const config = getSerializableConfig();
        const luna = new LunaContainer(config);

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

    const componentLoader = global.luna.get(ComponentLoader);
    await componentLoader.registerAvailableComponents();

    await callHook(HOOKS.COMPONENTS_LOADED, {
        components: componentLoader.getAvailableComponents()
    });

    const server = global.luna.get(Server);
    await server.start();
};

const stopLuna = async () => {
    const server = global.luna.get(Server);
    await server.stop();
}

export { prepareLuna, startLuna, stopLuna };
