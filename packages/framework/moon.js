import {getSerializableConfig, loadSettings} from "./config";
import {loadHooks} from "./loaders/hooks-loader";
import {callHook} from "./hooks";
import {HOOKS} from "./hooks/definitions";

import moonObject from "./shared/moon-object";

/**
 * The main initialization method of our moon js framework.
 * Here we load all settings, and initialize all required elements
 * on startup.
 *
 * Does not handle component/route registration.
 *
 * @returns {Promise<boolean>}
 */
const initializeMoon = async () => {
    // First we load all settings.
    if (!(await loadSettings())) {
        return false;
    }

    // Load and register all available hooks.
    await loadHooks();

    const config = getSerializableConfig();

    initializeMoonObject(config);
    return true;
};


const initializeMoonObject = (config) => {
    global.moon = callHook(HOOKS.MOON_INITIALIZE, moonObject(config));
};

export { initializeMoon };
