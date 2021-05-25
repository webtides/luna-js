import path from "path";

import {getSettings} from "@webtides/luna-js/src/framework/config";
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

const startApplicationDevelopmentBuild = async (callback = () => {
}) => {
    const settings = getSettings();
    // Clean the build directory before starting a new build.
    rimraf.sync(settings.build.output);

    let shouldRestart = false;
    let watcher;

    const initializeWatcher = async (restart = true) => {
        if (!restart) {
            return;
        }

        watcher = await startRollupWatch(
            path.join(global.lunaCli.currentDirectory, "build/configs", "rollup.config.application.js"),
            callback
        );

        watcher.on('close', async () => {
            console.log("WATCHER CLOSED", shouldRestart);
            await initializeWatcher(shouldRestart);
            shouldRestart = false;
        });
    };

    const componentDirectories = settings.components.bundles.map(bundle => bundle.input);
    chokidar.watch([
        ...componentDirectories,
        ...settings.pages.input,
        ...settings.api.input,
        ...settings.hooks.input
    ], {ignoreInitial: true})
        .on("add", async (event, filePath) => {
            console.log("File added. Restart watcher");

            setTimeout(async () => {
                shouldRestart = true;
                watcher && watcher.close();
            }, 20);
        })
        .on("unlink", async () => {
            console.log("File removed. Restart watcher");

            setTimeout(() => {
                shouldRestart = true;
                watcher && watcher.close();
            }, 20);
        });

    await initializeWatcher(true);
};

export {buildComponentsForApplication, startApplicationDevelopmentBuild};
