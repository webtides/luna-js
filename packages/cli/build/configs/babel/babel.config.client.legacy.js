module.exports = (api) => {
    api.cache(false);

    return {
        presets: [
            ["@babel/preset-env",
                {
                    "targets": {
                        "edge": "17",
                        "firefox": "60",
                        "chrome": "67",
                        "safari": "11.1",
                        "ie": "11"
                    },
                    "useBuiltIns": "usage",
                    "corejs": 3,
                }
            ]
        ],

        plugins: [
            "@babel/plugin-proposal-nullish-coalescing-operator",
            "@babel/plugin-proposal-optional-chaining",
            [ "@babel/plugin-proposal-decorators", { legacy: true } ],
            [ "@babel/plugin-proposal-class-properties", { loose: true } ],
            "@babel/plugin-proposal-export-default-from",
        ],

        sourceMaps: true
    }
}
