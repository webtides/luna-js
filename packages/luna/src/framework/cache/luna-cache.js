/**
 * The luna cache base class which includes the method stubs and
 * clears the require cache.
 */
import {LunaService} from "../../decorators/service";

@LunaService({
    name: 'Cache'
})
export default class LunaCache {
    async clear() {
        try {
            Object.keys(require.cache).forEach(key => delete require.cache[require.resolve(key)]);
        } catch {}
    }
    async get(key, group = 'default', defaultValue = false) {}
    async set(key, value, group = 'default') {}
    async has(key, group = 'default') {}
}
