import ServiceContainer from "../framework/services/service-container";

const LunaService = ({name, as, type }) => {
    return function decorator(Class) {

        if (typeof as !== 'undefined') {
            name = as?.$$luna?.serviceName;
        }

        // Set a static $$luna property to the class with meta information.
        Class.$$luna = {
            serviceName: name,
            serviceType: type ?? LunaService.SINGLETON,
        };

        return Class;
    }
};

LunaService.SINGLETON = 'singleton';
LunaService.PER_REQUEST = 'per_request';

const Inject = (service) => {
    return (target, name, descriptor) => {
        if (process.env.CLIENT_BUNDLE) {
            // Injectables currently only work in server context.
            descriptor.initializer = () => null;
            return;
        }

        delete descriptor.writable;
        delete descriptor.initializer;

        descriptor.set = function() {};
        descriptor.get = function() {
            if (service.$$luna?.serviceType === LunaService.PER_REQUEST) {

                // TODO: does a "PER_REQUEST" service make sense?

                const request = this?.$$luna?.request ?? false;
                const response = this?.$$luna?.response ?? false;

                if (!request || !response) {
                    throw new Error('Cannot use "PER_REQUEST" service on a class that isn´t in the luna lifecycle.');
                }

                const serviceName = service.$$luna.serviceName;

                if (!this.$$luna.request.$$luna.services[serviceName]) {
                    this.$$luna.request.$$luna.services[serviceName] = new service();
                }

                return this.$$luna.request.$$luna.services[serviceName];
            }

            // TODO: should an instance be set if not already present ??
            if (!luna.get(service)) {
                luna.set(service, new service());
            }

            const serviceInstance = luna.get(service);

            // Inject the current request into the service.
            if (serviceInstance) {
                serviceInstance.$$luna = {
                    ...(serviceInstance.$$luna ?? {}),
                    request: this.$$luna?.request,
                    response: this.$$luna?.response,
                };
            }

            return serviceInstance;
        };
    }
}

export {LunaService, Inject};
