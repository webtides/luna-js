let cache = { };

const clearCache = () => {
    try {
        Object.keys(require.cache).forEach(key => delete require.cache[require.resolve(key)]);
        cache = { }
    } catch { }
}

const loadFromCache = async (key, group = "default", defaultValue = false) => {
    if (cache[group] && cache[group][key]) {
        console.log("Cache hit", { key, group });
        return cache[group][key];
    }

    return defaultValue;
};

const writeToCache = async (key, value, group = "default") => {
    if (!cache[group]) {
        cache[group] = { };
    }

    cache[group][key] = value;
};

export {
    clearCache,
    writeToCache,
    loadFromCache
}
