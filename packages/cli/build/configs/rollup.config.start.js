import path from 'path';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import { getConfig } from '../../src/config';

export default async () => {
	const { settings } = getConfig();

	const production = process.env.NODE_ENV === 'production';

	const bundle = {
		input: '@webtides/luna-js/start.js',
		output: {
			dir: settings._generated.baseDirectory,
			entryFileNames: 'start.js',
			sourcemap: production ? false : 'inline',
			format: 'cjs',
		},
		plugins: [
			nodeResolve({
				resolveOnly: ['@webtides/luna-js'],
			}),
			babel({
				configFile: path.resolve(__dirname, '../..', 'babel.config.js'),
				babelHelpers: 'bundled',
			}),
			json(),
		],
	};

	return [bundle];
};
