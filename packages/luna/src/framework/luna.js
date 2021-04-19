import {getSerializableConfig, getSetting, loadSettings} from "./config";
import LunaBase from "./shared/luna-object";
import {loadHooks} from "./loaders/hooks-loader";
import {callHook} from "./hooks";
import {HOOKS} from "./hooks/definitions";
import MemoryCache from "./cache/memory-cache";
import ServiceContainer from "./engine/services/service-container";

/**
 * The luna base class. Also provides a simple service
 * container.
 */
class Luna extends LunaBase {
    services = {
        cache: 'cache'
    };

    serviceContainer = new ServiceContainer();

    serviceDefaults = {
        [this.services.cache]: MemoryCache
    };

    initialize() {
        Object.keys(this.serviceDefaults).map(name => {
            this.set(name, new this.serviceDefaults[name]());
        });
    }

    setting(key, defaultValue = false) {
        return getSetting(key, defaultValue);
    }

    get(name) {
        return this.serviceContainer.get(name);
    }

    set(name, implementation) {
        this.serviceContainer.set(name, implementation);
    }
}

/**
 * The main initialization method of our luna js framework.
 *
 * Does not handle component/route registration.
 *
 * @returns {Promise<boolean>}
 */
const initializeLuna = async () => {
    // Load and register all available hooks.
    await loadHooks();
    await callHook(HOOKS.LUNA_INITIALIZE, { luna: global.luna });
};

/**
 * This methods should be called before anything else.
 * Performs checks for required files and loads the settings.
 *
 * @returns {Promise<boolean>}
 */
const prepareLuna = async () => {
    // First we load all settings.
    if (!(await loadSettings())) {
        return false;
    }

    const config = getSerializableConfig();
    initializeLunaObject(config);

    luna.initialize();

    return true;
};


/**
 * Initialize the global luna object with a config that can be
 * shared between the server and client.
 *
 * @param config
 */
const initializeLunaObject = (config) => {
    global.luna = new Luna(config);
};

export { prepareLuna, initializeLuna };
