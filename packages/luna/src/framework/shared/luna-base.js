export default class LunaBase {
    constructor(config) {
        this.configuration = config;
    }

    asset(path) {
        if (path.indexOf("/") !== 0) {
            path = "/" + path;
        }

        return `${this.configuration.assets.domain ?? ""}${this.configuration.assets.context ?? ''}${path}`;
    }

    api(path) {
        if (path.indexOf("/") !== 0) {
            path = "/" + path;
        }

        return `${this.configuration.api.domain ?? ""}${this.configuration.api.context ?? ''}${path}`;
    }

    config(key = undefined, defaultValue = false) {
        if (typeof key === 'undefined') {
            return this.configuration;
        }

        const parts = key.split('.');
        let configuration = this.configuration;
        for (const part of parts) {
            if (configuration[part]) {
                configuration = configuration[part];
            } else {
                return defaultValue;
            }
        }
        return configuration;
    }
}
