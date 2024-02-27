import path from 'path';
import { loadManifest, loadSettings } from '../config.js';
import { registerHook } from '../hooks/index.js';
import { LunaService } from '../../decorators/service.js';

class HooksLoader {
	/**
	 * Loads all available hooks from the generated manifest and registers
	 * these hooks.
	 *
	 * @returns {Promise<*[]>}
	 */
	async loadHooks() {
		const settings = await loadSettings();

		const manifest = await loadManifest();
		const basePath = settings._generated.applicationDirectory;

		await Promise.all(manifest.hooks.map(async ({ file }) => {
			const module = (await import(path.resolve(path.join(basePath, file)))).default;
			registerHook(module.name, module.default);
		}));
	}
}

export default LunaService({ name: 'HooksLoader' })(HooksLoader);
