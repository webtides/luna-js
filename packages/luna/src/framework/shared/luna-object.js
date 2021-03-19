export default (config) => ({
    /**
     * The serializable configuration luna-js uses.
     */
    config: config,

    /**
     * Applies the configured asset path to this resource.
     *
     * @param path          The path of the resource without any configured
     *                      asset context.
     *
     * @returns {string}
     */
    asset: function(path) {
        if (path.indexOf("/") !== 0) {
            path = "/" + path;
        }

        return `${config.assets.domain || ""}${config.assets.context}${path}`;
    },


    /**
     * Applies the configured api path to this resource.
     *
     * @param path          The path of the api without any configured
     *                      api context.
     *
     * @returns {string}
     */
    api: function(path) {
        if (path.indexOf("/") !== 0) {
            path = "/" + path;
        }

        return `${config.api.domain || ""}${config.api.context}${path}`;
    }
});
