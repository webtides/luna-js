/**
 * Used for injecting services with a current request context.
 */
export default class ServiceContext {

    constructor(context) {
        this.context = context;
    }

    /**
     * Returns the service instance with the current request context
     * attached.
     *
     * @param service
     * @returns {{$$luna}|*}
     */
    get(service) {
        const serviceInstance = luna.get(service);

        // Inject the current request into the service.
        if (serviceInstance && typeof serviceInstance.prototype !== 'undefined') {
            serviceInstance.$$luna = {
                ...(serviceInstance.$$luna ?? {}),
                request: this.context?.$$luna?.request,
                response: this.context?.$$luna?.response,
            };
        }

        return serviceInstance;
    }
}
