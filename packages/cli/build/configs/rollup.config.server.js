import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

import { getConfig } from '../../src/config';

import { generateBasePathsFromLunaConfig } from '../plugins/helpers/entries';
import { rollupPluginManifest } from '../plugins/rollup-plugin-manifest';
import { rollupPluginMarkdown } from '../plugins/rollup-plugin-markdown';
import { rollupPluginPostcss } from '../plugins/rollup-plugin-postcss';
import { rollupPluginStripClientCode } from '../plugins/rollup-plugin-strip-client-code';

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
			format: 'cjs',
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
				resolveOnly: ['@webtides/luna-js', ...resolveNodeModules],
			}),
			replace({
				'process.env.CLIENT_BUNDLE': false,
				'process.env.SERVER_BUNDLE': true,
			}),
			babel({
				configFile: path.resolve(__dirname, '../..', 'babel.config.js'),
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
