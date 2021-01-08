import {startRollup} from "../build";
import path from "path";

const buildComponentsForServer = async () => {
    await startRollup(path.join(moon.currentDirectory, "build/configs/rollup.config.application.js"));
};

export {buildComponentsForServer};
