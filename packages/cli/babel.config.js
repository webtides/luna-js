export default (api) => {
	return {
		// presets: [['@babel/preset-env', { targets: { node: 16 }, loose: true, modules: false }]],
		plugins: [
			'@babel/plugin-proposal-nullish-coalescing-operator',
			'@babel/plugin-proposal-optional-chaining',
			['@babel/plugin-proposal-decorators', { legacy: true }],
			['@babel/plugin-proposal-class-properties', { loose: true }],
			'@babel/plugin-proposal-export-default-from',
			// ...(process.env.NODE_ENV === 'production' ? [] : ['source-map-support']),
		],
	};
};
