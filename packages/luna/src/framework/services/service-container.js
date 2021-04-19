export default class ServiceContainer {
    _services = { };

    get(id) {
        return this._services[id] ?? false;
    }

    set(id, instance) {
        this._services[id] = instance;
    }
}

