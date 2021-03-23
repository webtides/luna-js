const hooks = { };

/**
 * Registers a single hook.
 *
 * @param name      The name of the hook.
 *
 * @param hook      The hook function.
 */
const registerHook = (name, hook) => {
    hooks[name] = hook;
};

/**
 * Calls a single hook.
 *
 * @param name      The name of the hook.
 * @param params    The parameters with which the hook should be called.
 *
 * @returns {Promise<*>}    The results from the hook or the passed parameters
 *                          if the hook does not exist.
 */
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
