import {getSerializableConfig, getConfigValue, loadSettings, getSettings} from "./config";
import LunaBase from "./shared/luna-base";
import HooksLoader from "./loaders/hooks-loader";
import {callHook} from "./hooks";
import {HOOKS} from "./hooks/definitions";
import MemoryCache from "./cache/memory-cache";
import ServiceContainer from "./services/service-container";
import ApiLoader from "./loaders/api-loader";
import ComponentLoader from "./loaders/component-loader";
import PagesLoader from "./loaders/pages-loader";
import DocumentRenderer from "./engine/document-renderer";
import ElementRenderer from "./engine/element-renderer";
import LunaCache from "./cache/luna-cache";

/**
 * The luna base class. Also provides a simple service
 * container.
 */
class LunaContainer extends LunaBase {
    serviceDefaults = [
        /* CACHE */
        LunaCache,
        MemoryCache,

        /* LOADERS */
        ApiLoader,
        ComponentLoader,
        HooksLoader,

        /* RENDERERS */
        ElementRenderer,
        DocumentRenderer,

        /* SPECIAL (needs refactoring) */
        PagesLoader,
    ];

    initialize() {
        Object.keys(this.serviceDefaults).map(name => {

            this.set(this.serviceDefaults[name].$$luna.serviceName, new this.serviceDefaults[name]);
        });
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

/**
 * The main initialization method of our luna js framework.
 *
 * Does not handle component/route registration.
 *
 * @returns {Promise<boolean>}
 */
const initializeLuna = async () => {
    // Load and register all available hooks.
    await ServiceContainer.get(HooksLoader).loadHooks();
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

    // Only initialize luna once.
    if (!global.luna) {
        const config = getSerializableConfig();
        initializeLunaObject(config);
        luna.initialize();
    }

    return true;
};


/**
 * Initialize the global luna object with a config that can be
 * shared between the server and client.
 *
 * @param config
 */
const initializeLunaObject = (config) => {
    global.luna = new LunaContainer(config);
};

export { prepareLuna, initializeLuna };
