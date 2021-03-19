import {loadSettings} from "@webtides/luna-js/lib/framework/config";

import {startRollup, startRollupWatch} from "../build";
import path from "path";
import {prepareLegacyBuild} from "../legacy";
import chokidar from "chokidar";

const buildComponentsForApplication = async () => {
    const settings = await loadSettings();

    await startRollup(path.join(moonCli.currentDirectory, "build/configs/rollup.config.application.js"));

    if (settings.legacyBuild) {
        await prepareLegacyBuild();
        await startRollup(path.join(moonCli.currentDirectory, "build/configs/rollup.config.client.legacy.js"));
    }
};

const startApplicationDevelopmentBuild = async (callback = () => { }) => {
    const settings = await loadSettings();

    let watcher = await startRollupWatch(
        path.join(global.moonCli.currentDirectory, "build/configs", "rollup.config.application.js"),
        callback
    );

    const componentDirectories = settings.componentsDirectory.map(directory => path.join(directory.basePath, directory.directory));
    chokidar.watch([
        ...componentDirectories,
        ...settings.pagesDirectory,
        ...settings.apisDirectory,
        ...settings.hooksDirectory
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
