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

		manifest.hooks.forEach(({ file }) => {
			const module = require(path.resolve(path.join(basePath, file)));
			registerHook(module.name, module.default);
		});
	}
}

export default LunaService({ name: 'HooksLoader' })(HooksLoader);
