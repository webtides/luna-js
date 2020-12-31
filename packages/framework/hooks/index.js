const index = { };

const registerHook = (name, hook, index = 0) => {
    const registeredHooks = index[name] ?? [];

    let indexToInsert = 0;
    for (let i = 0; i < registeredHooks.length; i++) {
        if (hook.index >= index) {
            indexToInsert = i;
        }
    }

    registeredHooks.splice(indexToInsert, 0, hook);
    index[name] = registeredHooks;

    console.log("Registered hook", name);
};

const callHook = async (name, params = false) => {
    if (index[name]) {
        await Promise.all(index[name].map(hook => {
            return hook(params);
        }));
    }
};

export {
    registerHook,
    callHook
}
