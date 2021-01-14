import {startRollup, startRollupWatch} from "../build";
import path from "path";
import {prepareLegacyBuild} from "../legacy";
import {loadSettings} from "../../../framework/config";

const buildComponentsForApplication = async () => {
    const settings = await loadSettings();

    if (settings.legacyBuild) {
        await prepareLegacyBuild();
    }

    await startRollup(path.join(moon.currentDirectory, "build/configs/rollup.config.application.js"));
};

const startApplicationDevelopmentBuild = async (callback = () => { }) => {
    const settings = await loadSettings();

    if (settings.legacyBuild) {
        await prepareLegacyBuild();
    }

    startRollupWatch(path.join(global.moon.currentDirectory, "build/configs", "rollup.config.application.js"), callback);
};

export {buildComponentsForApplication, startApplicationDevelopmentBuild};
