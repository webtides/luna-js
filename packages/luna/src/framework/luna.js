import {getConfigValue, getSettings} from "./config";
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
import Server from "./http/server";
import Renderer from "./engine/renderer";

/**
 * The luna base class. Also provides a simple service
 * container.
 */
export default class LunaContainer extends LunaBase {
    serviceDefaults = [
        /* CACHE */
        LunaCache,
        MemoryCache,

        /* LOADERS */
        ApiLoader,
        ComponentLoader,
        HooksLoader,

        /* RENDERERS */
        Renderer,
        ElementRenderer,
        DocumentRenderer,

        /* SPECIAL (needs refactoring) */
        PagesLoader,

        Server,
    ];

    prepare() {
        Object.keys(this.serviceDefaults).map(name => {
            this.set(this.serviceDefaults[name].$$luna.serviceName, new this.serviceDefaults[name]);
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
