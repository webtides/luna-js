import path from "path";
import rimraf from 'rimraf';
import chokidar from 'chokidar';

import {loadSettings} from "@webtides/luna-js/src/framework/config";

import {startRollup, startRollupWatch} from "../build";
import {prepareLegacyBuild} from "../legacy";
import {getConfig} from "../../config";


const buildEntryPoint = async () => {
    console.log("Building entry point...");

    await startRollup(path.join(getConfig().currentDirectory, "build/configs/rollup.config.start.js"));

    console.log("Done building entry point.");
};

/**
 * Builds the whole application once.
 *
 * - Deletes the old output folder
 * - Builds the luna entrypoint
 * - Builds the application
 *
 * @returns {Promise<void>}
 */
const buildComponentsForApplication = async () => {
    const settings = await loadSettings();

    // Clean the build directory before starting a new build.
    rimraf.sync(settings.build.output);

    await buildEntryPoint();

    console.log("Building application..");

    await startRollup(path.join(getConfig().currentDirectory, "build/configs/rollup.config.application.js"));

    if (settings.build.legacy) {
        await prepareLegacyBuild();
        await startRollup(path.join(getConfig().currentDirectory, "build/configs/rollup.config.client.legacy.js"));
    }

    console.log("Done building application.");
};

const startApplicationDevelopmentBuild = async (callback = () => {
}) => {
    const settings = await loadSettings();

    // Clean the build directory before starting a new build.
    rimraf.sync(settings.build.output);

    await buildEntryPoint();

    console.log("Start application development build...");

    let watcher;

    const initializeServerWatcher = async (restart = true) => {
        if (!restart) {
            return;
        }

        watcher = await startRollupWatch(
            path.join(getConfig().currentDirectory, "build/configs", "rollup.config.server.js"),
            () => {
                callback();
            },
            () => {
                watcher && watcher.close();
            }
        );

        watcher.on('close', () => {
            initializeServerWatcher(true);
        })
    };

    chokidar.watch([
        ...settings.components.bundles.map(bundle => bundle.input),
        ...settings.pages.input,
        ...settings.api.input,
        ...settings.hooks.input
    ], { ignoreInitial: true })
        .on("add", async (event, filePath) => {
            console.log("File added. Restart watcher");
            watcher && watcher.close();
        });

    await initializeServerWatcher(true);
    await startRollupWatch(path.join(getConfig().currentDirectory, "build/configs", "rollup.config.client.js"));
};

export {buildEntryPoint, buildComponentsForApplication, startApplicationDevelopmentBuild};
