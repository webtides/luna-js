import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

import { getConfig } from '../../src/config.js';

import { generateBasePathsFromLunaConfig } from '../plugins/helpers/entries.js';
import { rollupPluginManifest } from '../plugins/rollup-plugin-manifest.js';
import { rollupPluginMarkdown } from '../plugins/rollup-plugin-markdown.js';
import { rollupPluginPostcss } from '../plugins/rollup-plugin-postcss.js';
import { rollupPluginStripClientCode } from '../plugins/rollup-plugin-strip-client-code.js';

export default async () => {
	const { settings } = getConfig();

	const { basePaths, files } = generateBasePathsFromLunaConfig(settings);
	const { resolveNodeModules } = settings.build.server;

	const production = process.env.NODE_ENV === 'production';

	const bundle = {
		input: files,
		output: {
			dir: settings._generated.applicationDirectory,
			entryFileNames: '[name].js',
			sourcemap: production ? false : 'inline',
			format: 'es',
			exports: 'auto',
		},
		plugins: [
			rollupPluginStripClientCode({
				basePaths,
			}),
			rollupPluginPostcss({
				serverInclude: true,
				basePaths,
			}),
			rollupPluginMarkdown(),
			nodeResolve({
				resolveOnly: (module) => !resolveNodeModules.includes(module),
			}),
			replace({
				'process.env.CLIENT_BUNDLE': false,
				'process.env.SERVER_BUNDLE': true,
			}),
			babel({
				configFile: path.resolve(getConfig().currentDirectory, 'babel.config.js'),
				babelHelpers: 'bundled',
			}),
			json(),
			rollupPluginManifest({
				config: basePaths,
			}),
			commonjs({
				requireReturnsDefault: true,
				transformMixedEsModules: true,
				ignoreGlobal: true,
			}),
		],
	};

	return [bundle];
};
