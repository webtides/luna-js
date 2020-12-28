module.exports = (api) => {
    api.cache(false);

    return {
        presets: [["@babel/preset-env"]],

        plugins: [
            "@babel/plugin-proposal-nullish-coalescing-operator",
            "@babel/plugin-proposal-optional-chaining",
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-proposal-export-default-from",
        ],

        sourceMaps: true
    }
}