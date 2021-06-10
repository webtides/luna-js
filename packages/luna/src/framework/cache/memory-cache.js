import LunaCache from "./luna-cache";
import {LunaService} from "../../decorators/service";

/**
 * A simple memory cache implementation. Saves the cache inside a class property. Not
 * recommended for larger applications.
 * Does not have any kind of automatic invalidation.
 */
@LunaService({
    as: LunaCache
})
export default class MemoryCache extends LunaCache {
    cache = {};

    async clear() {
        await super.clear();

        try {
            this.cache = { }
        } catch { }
    }

    async get(key, group = 'default', defaultValue = false) {
        if (this.cache[group] && this.cache[group][key]) {
            return this.cache[group][key];
        }

        return defaultValue;
    }

    async set(key, value, group = 'default') {
        if (!this.cache[group]) {
            this.cache[group] = { };
        }

        this.cache[group][key] = value;
    }

    async has(key, group = 'default') {
        return this.cache[group] && this.cache[group][key];
    }
}
