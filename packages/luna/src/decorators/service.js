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
        if (process.env.CLIENT_BUNDLE) {
            descriptor.initializer = () => null;
            return;
        }

        delete descriptor.writable;
        delete descriptor.initializer;

        descriptor.set = function() {};
        descriptor.get = function() {
            return global.luna.get(service);
        };
    }
}

export {LunaService, Inject};
