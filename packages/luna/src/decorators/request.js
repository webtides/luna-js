const CurrentRequest = (target, name, descriptor) => {
    if (process.env.CLIENT_BUNDLE) {
        // Injectables currently only work in server context.
        descriptor.initializer = () => null;
        return;
    }

    delete descriptor.writable;
    delete descriptor.initializer;

    descriptor.set = function () {};
    descriptor.get = function () {
        if (!this.$$luna?.request) {
            throw new Error('Cannot inject "CURRENT_REQUEST" on a class that isn´t in the luna lifecycle.');
        }

        return this.$$luna.request;
    };
};


export {CurrentRequest};
