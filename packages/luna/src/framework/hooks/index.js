/** @type {Object<string, Array<function>>} */
const hooks = {};

/**
 * Registers a single hook.
 * @param {string} name The name of the hook.
 * @param {function} hook The hook function.
 */
const registerHook = (name, hook) => {
	if (!hooks.hasOwnProperty(name)) {
		hooks[name] = [];
	}
	hooks[name].push(hook);
};

/**
 * Calls a single hook.
 * @param {string} name The name of the hook.
 * @param {*} params The parameters with which the hook should be called.
 * @returns {Promise<*[] | *>} The results from the hook or the passed parameters if the hook does not exist.
 */
const callHook = async (name, params = false) => {
    if (hooks[name]) {
		const results = [];
		for (const hook of hooks[name].toReversed()) {
			const result = await hook(params);
			results.push(result);
		}
		return results;
    }
    return params;
};

export { registerHook, callHook }
