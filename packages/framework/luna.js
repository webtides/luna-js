import {getSerializableConfig, loadSettings} from "./config";

import lunaObject from "./shared/luna-object";

/**
 * The main initialization method of our luna js framework.
 * Here we load all settings, and initialize all required elements
 * on startup.
 *
 * Does not handle component/route registration.
 *
 * @returns {Promise<boolean>}
 */
const initializeLuna = async () => {
    // First we load all settings.
    if (!(await loadSettings())) {
        return false;
    }

    const config = getSerializableConfig();

    initializeLunaObject(config);
    return true;
};


/**
 * Initialize the global luna object with a config that can be
 * shared between the server and client.
 *
 * @param config
 */
const initializeLunaObject = (config) => {
    global.luna = lunaObject(config);
};

export { initializeLuna };
