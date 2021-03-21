import {getSettings} from "@webtides/luna-js/lib/framework/config";

import {startRollup, startRollupWatch} from "../build";
import path from "path";
import {prepareLegacyBuild} from "../legacy";
import chokidar from "chokidar";

const buildComponentsForApplication = async () => {
    const settings = getSettings();

    await startRollup(path.join(moonCli.currentDirectory, "build/configs/rollup.config.application.js"));

    if (settings.build.legacy) {
        await prepareLegacyBuild();
        await startRollup(path.join(moonCli.currentDirectory, "build/configs/rollup.config.client.legacy.js"));
    }
};

const startApplicationDevelopmentBuild = async (callback = () => { }) => {
    const settings = getSettings();

    let watcher = await startRollupWatch(
        path.join(global.moonCli.currentDirectory, "build/configs", "rollup.config.application.js"),
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
                path.join(global.moonCli.currentDirectory, "build/configs", "rollup.config.application.js"),
                callback
            );
        });
};

export {buildComponentsForApplication, startApplicationDevelopmentBuild};
