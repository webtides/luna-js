import LunaCache from "./luna-cache";

/**
 * A simple memory cache implementation. Saves the cache inside a class property. Not
 * recommended for larger applications.
 * Does not have any kind of automatic invalidation.
 */
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
            console.log("Cache hit", { key, group });
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
