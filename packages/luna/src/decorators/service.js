const LunaService = ({name, as }) => {
    return function decorator(Class) {

        if (typeof as !== 'undefined') {
            name = as?.$$luna?.serviceName;
        }

        Class.$$luna = {
            serviceName: name
        };

        return Class;
    }
};

const Inject = (service) => {
    return (target, name, descriptor) => {
        delete descriptor.writable;
        delete descriptor.initializer;

        descriptor.set = function() {};
        descriptor.get = function() {
            return luna.get(service);
        };
    }
}

export {LunaService, Inject};
