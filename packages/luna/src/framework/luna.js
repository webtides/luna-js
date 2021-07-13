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
import ElementRenderer from "./engine/element-renderer";
import LunaCache from "./cache/luna-cache";
import Server from "./http/server";
import ElementFactory from "./engine/element-factory";

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
        ElementRenderer,

        /* SPECIAL (needs refactoring) */
        PagesLoader,

        Server,
    ];

    /**
     * A list of all available element factories which can be used to render custom elements
     * on the server.
     */
    elementFactories = []
    
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

        await this.setElementFactories();
    }

    async setElementFactories() {
        const settings = getSettings();
        if (settings.renderers) {
            this.elementFactories = await Promise.all(settings.renderers.map(async ({ match, renderer }) => {
                return {
                    match: match ?? (() => true),
                    factory: (await renderer()).ElementFactory,
                }
            }));
        } else {
            this.elementFactories = [ {
                match: () => true,
                factory: ElementFactory,
            } ]
        }
    }

    async getDefaultElementFactory() {
        if (this.elementFactories.length === 0) {
            await this.setElementFactories();
        }

        return this.elementFactories[0].factory;
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
