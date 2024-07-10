export default (api) => {
	api.cache(true);
	return {
		plugins: [
			['@babel/plugin-proposal-decorators', { legacy: true }],
			['@babel/plugin-proposal-class-properties', { loose: true }],
		],
	};
};
