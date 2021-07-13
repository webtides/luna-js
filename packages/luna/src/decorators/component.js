const Component = ({ selector, server = true, client = false } = {}) => {
    return function decorator(Class) {
        Class.$$luna = {
            ...(Class.$$luna ?? {}),
            selector,
            target: Component.TARGET_SERVER,
        };

        return Class;
    }
};

Component.TARGET_SERVER = 'server';
Component.TARGET_CLIENT = 'client';
Component.TARGET_BOTH = 'both';

export { Component };
