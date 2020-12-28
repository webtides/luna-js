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
                    }
                }
            ]
        ],

        plugins: [
            "@babel/plugin-proposal-nullish-coalescing-operator",
            "@babel/plugin-proposal-optional-chaining",
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-proposal-export-default-from",
        ],

        sourceMaps: true
    }
}
