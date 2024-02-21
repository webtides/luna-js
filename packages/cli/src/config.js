const setConfig = (_config) => {
	global.lunaCLIConfig = _config;
};

const getConfig = () => global.lunaCLIConfig;

export { setConfig, getConfig };
