module.exports = (api) => {
	api.cache(false);

	return {
		presets: [['@babel/preset-env', { targets: { node: 12 }, loose: true }]],
		plugins: [
			['@babel/plugin-proposal-decorators', { legacy: true }],
			['@babel/plugin-proposal-class-properties', { loose: true }],
		],
	};
};
