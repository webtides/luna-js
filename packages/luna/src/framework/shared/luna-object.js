export default class LunaBase {
    constructor(config) {
        this.config = config;
    }

    asset(path) {
        if (path.indexOf("/") !== 0) {
            path = "/" + path;
        }

        return `${this.config.assets.domain || ""}${this.config.assets.context}${path}`;
    }

    api(path) {
        if (path.indexOf("/") !== 0) {
            path = "/" + path;
        }

        return `${this.config.api.domain || ""}${this.config.api.context}${path}`;
    }
}
