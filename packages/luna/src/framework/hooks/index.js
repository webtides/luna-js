const hooks = { };

const registerHook = (name, hook, index = 0) => {
    hooks[name] = hook;
};

const callHook = async (name, params = false) => {
    if (hooks[name]) {
        return hooks[name](params);
    }

    return params;
};

export {
    registerHook,
    callHook
}
