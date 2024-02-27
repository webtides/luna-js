export default {
	port: 3010,

	build: {
		output: '.build',
	},

	pages: {
		input: ['views/pages'],
		fallback: '/custom-fallback',
	},

	layouts: {
		input: ['views/layouts'],
	},

	components: {
		bundles: [
			{
				input: 'views/components',
				output: 'assets',

				styles: {
					output: 'assets/css/base.css',
				},
			},
		],
	},

	api: {
		input: [ 'api'],
		fallback: '/fallback-api',
	},

	hooks: {
		input: ['hooks'],
	},

	routes: {
		cacheable: [/cache/],
	},

	assets: {
		styles: {
			bundles: [],
		},
		static: {
			sources: [{ input: 'assets/**/*', output: 'assets/static' }],
		},
	},

	export: {
		api: {
			output: {
				directory: '.api',
				filename: 'test-export.js',
			},

			excluded: ['cors'],
		},

		pages: async () => {
			return ['', '/fallback', '/params/export'];
		},
	},
};
