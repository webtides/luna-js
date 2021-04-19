export default class ServiceContainer {
    _services = { };

    get(name) {
        return this._services[name] ?? false;
    }

    set(name, instance) {
        this._services[name] = instance;
    }
}
