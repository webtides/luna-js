import fs from 'fs';
import path from 'path';
import { requireDynamically } from './helpers/dynamic-require';

import { getEntryType } from './helpers/entries';

// This is used so that we can have a chain of imports
// an still load the appropriate stub
//
// eg: InputElement -> BaseInputElement -> TemplateElement
const availableEntryTypes = {};

/**
 * Looks through the custom server renderers that can be defined in the luna.config.js
 * and swaps all imports on the server with the defined stubs.
 *
 * @param basePaths     The base paths for components and pages.
 * @param settings      The settings that have been loaded from the luna.config.js
 *
 * @returns {*}
 */
export const rollupPluginStripClientCode = function ({ basePaths }) {
	const resolvedStubs = {};

	return {
		name: 'luna-strip-client-code',

		async resolveId(source, importer, options) {
			let entryType = getEntryType(importer, basePaths);

			if (entryType === null) {
				// There is a chance we can are a child of the entry type.
				entryType = availableEntryTypes[importer];
			}

			if (entryType && typeof entryType.settings?.factory === 'string') {
				const { factory } = entryType.settings;

				const factoryModule = requireDynamically(factory);

				// This is probably pretty expensive. Is there a way with a smaller footprint?
				const resolution = await this.resolve(source, importer, { skipSelf: true, ...options });

				if (resolution?.id && path.isAbsolute(resolution.id)) {
					availableEntryTypes[resolution.id] = entryType;
				}

				const stubs = await factoryModule.stubs();
				for (const { sources, stub } of stubs) {
					if (sources.includes(source)) {
						resolvedStubs[source] = stub;
						return source;
					}
				}
			}

			return null;
		},

		async load(id) {
			if (resolvedStubs[id]) {
				const stub = resolvedStubs[id];
				return fs.readFileSync(stub, 'utf-8');
			}

			return null;
		},
	};
};
