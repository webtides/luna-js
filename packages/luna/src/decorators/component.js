const Component = ({ selector, ssr = true, csr = false } = {}) => {
    return function decorator(Class) {

        /* Use the same names as before for legacy support */
        Class.disableSSR = !ssr;
        Class.disableCSR = !csr;

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
