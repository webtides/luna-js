import path from 'node:path';
import fs from 'node:fs';

import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';
import postcssPluginImport from 'postcss-import';
import glob from 'glob-all';

import { getEntryType } from './helpers/entries.js';

const basePostcssPluginsBefore = [postcssPluginImport];

const basePostcssPluginsAfter = [];

/**
 *
 * @param options {{ ignore: boolean, publicDirectory: string, output: string, serverInclude: boolean, plugins: function, basePaths: {} }}
 * @returns {string|{transform(*=, *=): Promise<string|{code: string, map: SourceMapGenerator & {toJSON(): RawSourceMap}}|null>, writeBundle(): Promise<void>, name: string, resolveId(*=, *=): Promise<string|*|null>}|null|{code: string, map: SourceMap}|*}
 */
export const rollupPluginPostcss = function (options) {
	const importers = {};
	const extractedCss = {};
	const idsToExtract = [];

	const loadPostcssConfig = async () => {
		let result = false;

		try {
			result = await postcssLoadConfig();
		} catch (error) {
			console.error('Error loading the postcss config file', error);
		}

		return result;
	};

	const processCss = async ({ css, plugins, from = process.cwd() }) => {
		const loadedPostcssConfig = await loadPostcssConfig();

		const pluginsToUse = loadedPostcssConfig
			? loadedPostcssConfig.plugins
			: [...basePostcssPluginsBefore, ...plugins(), ...basePostcssPluginsAfter];

		return postcss(pluginsToUse).process(css, {
			...(loadedPostcssConfig ? loadedPostcssConfig.option : {}),
			from,
		});
	};

	const loadAppropriatePlugins = (id) => {
		if (!options.serverInclude) {
			return options.plugins ?? (() => []);
		}

		return getEntryType(id, options.basePaths)?.settings?.styles?.plugins ?? (() => []);
	};

	const processCssAndWatchDependencies = async function (code, id, addWatchFile) {
		const { css, map, messages } = await processCss({
			css: code,
			plugins: loadAppropriatePlugins(id),
			from: id,
		});

		messages.forEach((message) => {
			if (message.type === 'dependency') {
				addWatchFile(message.file);
			} else if (message.type === 'dir-dependency') {
				if (!message.dir) {
					return;
				}

				const messageGlob = message.glob ?? '**/*';

				const files = glob.sync([path.join(message.dir, messageGlob)]);
				if (files) {
					files.forEach((file) => addWatchFile(file));
				}
			}
		});

		return { css, map };
	};

	return {
		name: 'luna-postcss',

		async resolveId(source, importer) {
			if (source.endsWith('.css')) {
				if (!!importer) {
					const importerDirectory = path.dirname(importer);

					const id = path.join(importerDirectory, source);
					importers[id] = importer;

					return id;
				}

				// We have imported the css file directly.
				idsToExtract.push(source);
				return source;
			}

			return null;
		},

		async transform(code, id) {
			if (id.endsWith('.css') && importers[id]) {
				if (options.ignore) {
					return 'export default null';
				}

				const { css, map } = await processCssAndWatchDependencies(code, id, this.addWatchFile);

				const moduleInformation = this.getModuleInfo(importers[id]);

				// Check if the imported css is assigned to a variable. If not, we should extract it.
				moduleInformation.ast.body.map((node) => {
					if (node.type === 'ImportDeclaration') {
						if (
							path.join(path.dirname(importers[id]), node.source.value) === id &&
							node.specifiers.length === 0
						) {
							extractedCss[id] = css;
						}
					}
				});

				// We can always export the css, because it will be removed if it is unused.
				return {
					code: `export default \`${css}\`;`,
					map,
				};
			}

			if (idsToExtract.includes(id)) {
				if (options.ignore || (options.serverInclude ?? false)) {
					return 'export default null';
				}

				extractedCss[id] = (await processCssAndWatchDependencies(code, id, this.addWatchFile)).css;
				return '';
			}

			return null;
		},

		async writeBundle() {
			if (options.ignore || options.serverInclude) {
				return;
			}

			const output = path.join(options.publicDirectory, options.output);
			const outputDirectory = path.dirname(output);

			const css = Object.values(extractedCss).join('\r\n');

			if (!fs.existsSync(outputDirectory)) {
				fs.mkdirSync(outputDirectory, { recursive: true });
			}

			console.log('Writing extracted css to', output);

			fs.writeFileSync(output, css, 'utf-8');
		},
	};
};
