/**
 * The luna cache base class which includes the method stubs
 */
import { LunaService } from '../../decorators/service.js';

class LunaCache {
	async clear() {}
	async get(key, group = 'default', defaultValue = false) {}
	async set(key, value, group = 'default') {}
	async has(key, group = 'default') {}
}

export default LunaService({ name: 'Cache' })(LunaCache);
