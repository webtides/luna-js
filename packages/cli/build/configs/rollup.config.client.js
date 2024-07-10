import path from 'node:path';
import glob from 'glob-all';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

import { getConfig } from '../../src/config.js';

import { clientManifest } from '../plugins/rollup-plugin-client-manifest.js';
import { rollupPluginCopy } from '../plugins/rollup-plugin-copy.js';
import { rollupPluginMarkdown } from '../plugins/rollup-plugin-markdown.js';
import { rollupPluginPostcss } from '../plugins/rollup-plugin-postcss.js';
import { rollupPluginStripServerCode } from '../plugins/rollup-plugin-strip-server-code.js';

export default async () => {
	const production = process.env.NODE_ENV === 'production';
	const { settings } = getConfig();

	const configBundle = {
		input: `@webtides/luna-js/src/client/functions/luna.js`,
		output: {
			dir: settings.publicDirectory,
		},
		plugins: [
			nodeResolve(),
			babel({
				configFile: path.resolve(getConfig().currentDirectory, 'build/configs/babel', 'babel.config.client.js'),
				babelHelpers: 'bundled',
			}),
		],
	};

	const styleBundles =
		settings.assets?.styles?.bundles?.map((bundle) => {
			return {
				input: bundle.input,
				output: {
					dir: path.join(settings.publicDirectory, path.dirname(bundle.output)),
					entryFileNames: 'empty.js',
				},
				plugins: [
					rollupPluginPostcss({
						publicDirectory: settings.publicDirectory,
						...bundle,
					}),
				],
			};
		}) ?? [];

	const componentBundles = (
		settings.components?.bundles?.flatMap((bundle) => {
			const inputFiles = glob.sync([path.join(bundle.input, '**/*.js')]);

			if (inputFiles.length === 0) {
				return false;
			}

			return [
				{
					preserveSymlinks: true,
					input: inputFiles,
					output: {
						dir: path.join(settings.publicDirectory, bundle.output),
						entryFileNames: production ? '[name]-[hash].js' : '[name].js',
						sourcemap: production ? false : 'inline',
						format: 'es',
					},
					plugins: [
						rollupPluginStripServerCode(),
						rollupPluginPostcss({
							publicDirectory: settings.publicDirectory,
							...bundle.styles,
						}),
						rollupPluginMarkdown(),
						clientManifest({
							config: bundle,
						}),
						json(),
						nodeResolve(),
						replace({
							'process.env.CLIENT_BUNDLE': true,
							'process.env.SERVER_BUNDLE': false,
						}),
						babel({
							configFile: path.resolve(getConfig().currentDirectory, 'build/configs/babel', 'babel.config.client.js'),
							babelHelpers: 'bundled',
						}),
						commonjs({ requireReturnsDefault: true, transformMixedEsModules: true }),
						rollupPluginCopy({
							publicDirectory: settings.publicDirectory,
							sources: [
								{ input: path.resolve(getConfig().currentDirectory, 'src/client/**/*'), output: 'assets/dev' },
								...(settings?.assets?.static?.sources ?? []),
							],
						}),
						production ? terser() : undefined,
					],
				},
			];
		}) ?? []
	).filter((bundle) => !!bundle);

	return [configBundle, ...styleBundles, ...componentBundles];
};
