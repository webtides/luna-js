const path = require('path');

module.exports = {
	port: 3011,

	build: {
		output: '.build',
		legacy: true,
	},

	pages: {
		input: [path.join(__dirname, 'views/pages')],
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

	assets: {
		styles: {
			bundles: [],
		},
		static: {
			sources: [],
		},
	},
};
