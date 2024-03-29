const path = require('path');

module.exports = {
	port: 3010,

	build: {
		output: '.build',
	},

	pages: {
		input: [path.join(__dirname, 'views/pages')],
		fallback: '/custom-fallback',
	},

	layouts: {
		input: [path.join(__dirname, 'views/layouts')],
	},

	components: {
		bundles: [
			{
				input: path.join(__dirname, 'views/components'),
				output: 'assets',

				styles: {
					output: 'assets/css/base.css',
				},
			},
		],
	},

	api: {
		input: [path.join(__dirname, 'api')],
		fallback: '/fallback-api',
	},

	hooks: {
		input: [path.join(__dirname, 'hooks')],
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
