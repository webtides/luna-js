export default class ServiceContainer {
    static _services = {};

    static get(id) {
        if (id.$$luna?.serviceName ?? false) {
            return ServiceContainer._services[id.$$luna.serviceName] ?? false;
        }

        return ServiceContainer._services[id] ?? false;
    }

    static set(id, instance) {
        if (id.$$luna?.serviceName ?? false) {
            ServiceContainer._services[id.$$luna.serviceName] = instance;
            return;
        }

        ServiceContainer._services[id] = instance;
    }
}

