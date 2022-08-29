import path from 'path';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

import { rollupPluginApiExport } from '../plugins/rollup-plugin-export.js';
import { rollupPluginMarkdown } from '../plugins/rollup-plugin-markdown.js';
import { getConfig } from '../../src/config.js';

const { settings } = getConfig();

const outputDirectory = settings.export?.api?.output?.directory ?? settings.export.output;
const externals = settings.export?.api?.externals ?? [];

const entryFileNames = settings.export?.api?.output.filename ?? 'api-server.js';

const production = process.env.NODE_ENV === 'production';

export default {
	input: path.join(settings._generated.baseDirectory, 'entry.apis.js'),
	output: {
		dir: outputDirectory,
		sourcemap: production ? false : 'inline',
		entryFileNames,
		format: 'cjs',
	},
	external: [...externals],
	plugins: [
		rollupPluginMarkdown(),
		nodeResolve({
			resolveOnly: ['@webtides/luna-js', '@webtides/luna-cli'],
		}),
		commonjs({ requireReturnsDefault: true }),
		babel({
			configFile: path.resolve(getConfig().currentDirectory, 'babel.config.js'),
			babelHelpers: 'bundled',
		}),
		json(),
		rollupPluginApiExport({ outputDirectory, externals }),
	],
};
