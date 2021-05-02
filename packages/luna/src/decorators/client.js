const TagName = (tagName) => function(Class) {
    if (process.env.CLIENT_BUNDLE) {
        return Class;
    }

    Class.$$luna = Class.$$luna ?? {};
    Class.$$luna.tagName = tagName;

    return Class;
};

const HydrateOnConnected = function(Class) {
    if (!process.env.CLIENT_BUNDLE) {
        return Class;
    }

    return class extends Class {
        constructor(...args) {
            super(...args);

            this.$$luna = this.$$luna ?? {};
            this.$$luna.hydrateOnConnected = true;
        }
    }
}

export { HydrateOnConnected, TagName };
