const Component = ({ selector, server = true, client = false } = {}) => {
    return function decorator(Class) {
        Class.$$luna = {
            ...(Class.$$luna ?? {}),
            selector,
            server,
            client,
        };

        return Class;
    }
};

export { Component };
