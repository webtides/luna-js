import path from "path";

import {getSettings} from "@webtides/luna-js/lib/framework/config";
import rimraf from 'rimraf';
import chokidar from "chokidar";

import {startRollup, startRollupWatch} from "../build";
import {prepareLegacyBuild} from "../legacy";

const buildComponentsForApplication = async () => {
    const settings = getSettings();
    // Clean the build directory before starting a new build.
    rimraf.sync(settings.build.output);

    await startRollup(path.join(lunaCli.currentDirectory, "build/configs/rollup.config.application.js"));

    if (settings.build.legacy) {
        await prepareLegacyBuild();
        await startRollup(path.join(lunaCli.currentDirectory, "build/configs/rollup.config.client.legacy.js"));
    }
};

const startApplicationDevelopmentBuild = async (callback = () => { }) => {
    const settings = getSettings();
    // Clean the build directory before starting a new build.
    rimraf.sync(settings.build.output);

    let watcher = await startRollupWatch(
        path.join(global.lunaCli.currentDirectory, "build/configs", "rollup.config.application.js"),
        callback
    );

    const componentDirectories = settings.components.bundles.map(bundle => bundle.input);
    chokidar.watch([
        ...componentDirectories,
        ...settings.pages.input,
        ...settings.api.input,
        ...settings.hooks.input
    ], { ignoreInitial: true })
        .on("add", async (event, filePath) => {
            console.log("File added. Restart watcher");

            watcher && watcher.close();
            watcher = await startRollupWatch(
                path.join(global.lunaCli.currentDirectory, "build/configs", "rollup.config.application.js"),
                callback
            );
        });
};

export {buildComponentsForApplication, startApplicationDevelopmentBuild};
