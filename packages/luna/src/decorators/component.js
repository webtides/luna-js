const Component = ({ selector, ssr = true, csr = false } = {}) => {
    return function decorator(Class) {
        Class.$$luna = {
            ...(Class.$$luna ?? {}),
            selector,
            csr,
            ssr,
        };

        return Class;
    }
};

export { Component };
