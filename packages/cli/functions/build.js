import {loadSettings} from "../../framework/config";
import {prepareLegacyBuild} from "./legacy";

const rollup = require("rollup");
const loadConfigFile = require('rollup/dist/loadConfigFile');
const path = require("path");


const startRollupWatch = async (configFile, callback = () => {}) => {
    const { options, warnings } = await loadConfigFile(configFile);
    warnings.flush();

    const watcher = rollup.watch(options);
    watcher.on("event", ({ code, result }) => {
        switch (code) {
            case "BUNDLE_END":
                result.close();
                return;
            case "START":
                console.log("Compiling client components.");
                break;
            case "END":
                console.log("Client components compiled successfully.");
                callback();
                break;
        }
    });

    console.log("Start watching client components.");
}

const startRollup = async (configFile) => {
    const { options, warnings } = await loadConfigFile(configFile);
    warnings.flush();

    for (const option of options) {
        const bundle = await rollup.rollup(option);

        for (const outputOptions of option.output) {
            await bundle.write(option.output[0]);
        }

        await bundle.close();
    }

}

const startDevelopmentBuilds = async () => {
    startRollupWatch(path.join(global.moon.currentDirectory, "rollup.config.client.js"));
};

const build = async () => {
    const settings = await loadSettings();

    if (settings.legacyBuild) {
        await prepareLegacyBuild();
    }

    await startRollup(path.join(global.moon.currentDirectory, "rollup.config.client.js"));
};

export {
    startDevelopmentBuilds,
    build
}
