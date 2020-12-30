const cache = { };

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
    writeToCache,
    loadFromCache
}
