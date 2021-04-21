module.exports = (api) => {
    api.cache(false);

    return {
        presets: [["@babel/preset-env", { "targets": { "node": 12 } }]],
        plugins: [
            "@babel/plugin-proposal-nullish-coalescing-operator",
            "@babel/plugin-proposal-optional-chaining",
            [ "@babel/plugin-proposal-decorators", { legacy: true } ],
            [ "@babel/plugin-proposal-class-properties", { loose: true } ],
            "@babel/plugin-proposal-export-default-from",
        ],
    }
}
