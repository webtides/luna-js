import {startRollup, startRollupWatch} from "../build";
import path from "path";

const buildComponentsForApplication = async () => {
    await startRollup(path.join(moon.currentDirectory, "build/configs/rollup.config.application.js"));
};

const startApplicationDevelopmentBuild = (callback = () => { }) => {
    startRollupWatch(path.join(global.moon.currentDirectory, "build/configs", "rollup.config.application.js"), callback);
};

export {buildComponentsForApplication, startApplicationDevelopmentBuild};
