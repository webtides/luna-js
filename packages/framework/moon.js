import {getSerializableConfig, loadSettings} from "./config";

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

    const config = getSerializableConfig();

    initializeMoonObject(config);
    return true;
};


const initializeMoonObject = (config) => {
    global.moon = moonObject(config);
};

export { initializeMoon };
