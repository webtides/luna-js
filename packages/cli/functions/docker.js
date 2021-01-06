import {registerAvailableComponents} from "../../framework/loaders/component-loader";
import {loadSettings} from "../../framework/config";
const exec = require('child_process').exec;
const path = require("path");
const fs = require("fs");

const removeUnnecessaryDependencies = async () => {
    const dependenciesToRemove = [
        "@babel/cli", "@babel/core", "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-export-default-from", "@babel/plugin-proposal-nullish-coalescing-operator",
        "@babel/plugin-proposal-optional-chaining", "@babel/plugin-transform-classes", "@babel/plugin-transform-modules-commonjs",
        "@babel/plugin-transform-runtime", "@babel/preset-env", "@babel/register", "@babel/runtime",
        "@rollup/plugin-babel", "@rollup/plugin-commonjs", "@rollup/plugin-json",
        "@rollup/plugin-multi-entry", "@rollup/plugin-node-resolve", "@webtides/element-js",
        "acorn", "acorn-walk", "babel-plugin-module-resolver",
        "postcss", "postcss-import", "postcss", "postcss-preset-env", "rollup",
        "rollup-plugin-node-resolve", "rollup-plugin-postcss"
    ];

    const executeSingleCommand = (command) => {
        return new Promise((resolve, reject) => {
            exec(command, () => {
                resolve();
            });
        });
    }

    for (const dependency of dependenciesToRemove) {
        await executeSingleCommand(`npm uninstall ${dependency}`);

        console.log("Remove", dependency);
    }
};

const prepareForDocker = async () => {
    console.log("Preparing for docker");

    const settings = await loadSettings();

    const availableComponents = (await registerAvailableComponents({generateCssBundles: true}));

    const generatedDirectory = path.join(settings.buildDirectory, "generated");
    if (!fs.existsSync(generatedDirectory)) {
        fs.mkdirSync(generatedDirectory);
    }

    const manifest = {availableComponents};

    fs.writeFileSync(path.join(generatedDirectory, "manifest.json"), JSON.stringify(manifest), {encoding: "utf-8"});

    removeUnnecessaryDependencies();
};


export { prepareForDocker };
