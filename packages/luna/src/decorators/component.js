const Component = ({ selector, target } = {}) => {
    return function decorator(Class) {
        Class.$$luna = {
            ...(Class.$$luna ?? {}),
            selector,
            target: target ?? Component.TARGET_SERVER,
        };

        return Class;
    }
};

Component.TARGET_SERVER = 'server';
Component.TARGET_CLIENT = 'client';
Component.TARGET_BOTH = 'both';

export { Component };
