import path from 'path';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import { getConfig } from '../../src/config.js';

export default async () => {
	const { settings } = getConfig();

	const production = process.env.NODE_ENV === 'production';

	const entries = ['start', 'framework'];
	return entries.map((entry) => ({
		input: `@webtides/luna-js/${entry}.js`,
		output: {
			dir: settings._generated.baseDirectory,
			entryFileNames: `${entry}.js`,
			sourcemap: production ? false : 'inline',
			format: 'cjs',
		},
		plugins: [
			nodeResolve({
				resolveOnly: ['@webtides/luna-js'],
			}),
			babel({
				configFile: path.resolve(getConfig().currentDirectory, 'babel.config.js'),
				babelHelpers: 'bundled',
			}),
			json(),
		],
	}));
};
