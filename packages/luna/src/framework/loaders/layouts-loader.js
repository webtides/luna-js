import path from 'path';
import { loadManifest, loadSettings } from '../config.js';
import { LunaService } from '../../decorators/service.js';

class LayoutsLoader {
	#layouts;

	constructor() {
		this.#layouts = {};
	}

	async registerAvailableLayouts() {
		const settings = await loadSettings();
		const manifest = await loadManifest();

		const basePath = settings._generated.applicationDirectory;

		for (const layoutOptions of manifest.layouts) {
			const { file, name } = layoutOptions;

			this.#layouts[name] = (await import(path.resolve(path.join(basePath, file)))).default;
		}
	}

	getLayoutByName(name) {
		return this.#layouts[name];
	}
}

export default LunaService({ name: 'LayoutsLoader' })(LayoutsLoader);
