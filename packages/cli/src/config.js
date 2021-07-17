import path from "path";

let config = {};

const setConfig = (_config) => {
    config = { ..._config };
}

const getConfig = () => config;

export { setConfig, getConfig };
