import glob from 'glob';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const bundles = [
	{
		name: 'lit',
		resolve: [
			'@webtides/luna-js',
			'lit-html',
			'lit',
			'lit-element',
			'@lit-labs/ssr',
			'@lit-labs/ssr-dom-shim',
			'@lit/reactive-element',
			'@lit-labs/ssr-client',
		],
	},
];

const bundleConfigs = bundles.map((bundle) => ({
	input: `./src/${bundle.name}/index.js`,
	output: {
		file: `./lib/${bundle.name}/index.js`,
		format: 'es',
		exports: 'auto',
		inlineDynamicImports: true,
	},
	plugins: [
		// metaImportUrl(),
		nodeResolve({
			resolveOnly: bundle.resolve ?? [],
		}),
		commonjs({
			requireReturnsDefault: true,
			transformMixedEsModules: true,
		}),
	],
}));

const stubConfigs = bundles
	.flatMap((bundle) => {
		return glob.sync(`./src/${bundle.name}/stubs/*`);
	})
	.filter((stub) => !!stub)
	.map((stub) => {
		return {
			input: stub,
			output: {
				file: stub.split('/src/').join('/lib/'),
				format: 'es',
				exports: 'auto',
			},
			plugins: [
				nodeResolve(),
				// metaImportUrl(),
				commonjs({
					requireReturnsDefault: true,
					transformMixedEsModules: true,
				}),
			],
		};
	});

export default [...bundleConfigs, ...stubConfigs];
