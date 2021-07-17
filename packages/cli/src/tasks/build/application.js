import path from "path";
import rimraf from 'rimraf';
import chokidar from 'chokidar';

import {loadSettings} from "@webtides/luna-js/src/framework/config";

import {startRollup, startRollupWatch} from "../build";
import {prepareLegacyBuild} from "../legacy";
import {getConfig} from "../../config";


const buildEntryPointForProduction = async () => {
    await startRollup(path.join(getConfig().currentDirectory, "build/configs/rollup.config.start.js"));
};

const buildComponentsForApplication = async () => {
    const settings = await loadSettings();

    // Clean the build directory before starting a new build.
    rimraf.sync(settings.build.output);

    await startRollup(path.join(getConfig().currentDirectory, "build/configs/rollup.config.application.js"));

    if (settings.build.legacy) {
        await prepareLegacyBuild();
        await startRollup(path.join(getConfig().currentDirectory, "build/configs/rollup.config.client.legacy.js"));
    }
};

const startApplicationDevelopmentBuild = async (callback = () => {
}) => {
    const settings = await loadSettings();


    // TODO reregister all routes and restart luna

    // Clean the build directory before starting a new build.
    rimraf.sync(settings.build.output);

    let watcher;

    const initializeWatcher = async (restart = true) => {
        if (!restart) {
            return;
        }

        watcher = await startRollupWatch(
            path.join(getConfig().currentDirectory, "build/configs", "rollup.config.application.js"),
            () => {
                console.log("UPDATE APPLICATION");
                callback();
            },
            () => {
                watcher && watcher.close();
            }
        );

        watcher.on('close', () => {
            initializeWatcher(true);
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

    await initializeWatcher(true);
};

export {buildEntryPointForProduction, buildComponentsForApplication, startApplicationDevelopmentBuild};
