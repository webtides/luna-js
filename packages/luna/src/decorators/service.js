import ServiceContext from "../framework/services/service-context";

const LunaService = ({name, as, type }) => {
    return function decorator(Class) {

        if (typeof as !== 'undefined') {
            name = as?.$$luna?.serviceName;
        }

        // Set a static $$luna property to the class with meta information.
        Class.$$luna = {
            serviceName: name,
        };

        return Class;
    }
};

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
            return (new ServiceContext(this)).get(service);
        };
    }
}

export {LunaService, Inject};
