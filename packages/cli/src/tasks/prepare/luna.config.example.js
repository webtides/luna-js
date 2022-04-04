import path from 'path';

export default {
	build: {
		output: '.build',

		server: {
			resolveNodeModules: [],
		},
	},

	pages: {
		input: [path.join(process.cwd(), 'views/pages')],
	},

	layouts: {
		input: [path.join(process.cwd(), 'views/layouts')],
	},

	api: {
		input: [path.join(process.cwd(), 'api')],
	},

	components: {
		bundles: [
			{
				input: path.join(process.cwd(), 'views/components'),
				output: 'assets',

				styles: {
					output: 'assets/css/base.css',
					plugins: () => [],
				},
			},
		],
	},

	hooks: {
		input: [path.join(process.cwd(), 'hooks')],
	},

	assets: {
		styles: {
			bundles: [
				{
					input: [path.join(process.cwd(), 'assets/css/main.css')],

					output: 'assets/css/main.css',
					plugins: () => [],
				},
			],
		},

		static: {
			sources: [],
		},
	},

	export: {
		output: '.export',

		api: {
			output: {
				directory: '.api',
				filename: 'api-server.js',
			},
		},
	},
};
