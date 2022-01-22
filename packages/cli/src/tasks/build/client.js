import path from "path";
import {startRollup, startRollupWatch} from "../build";
import {getConfig} from "../../config";

const startClientDevelopmentBuild = () => {
    startRollupWatch(path.join(getConfig().currentDirectory, "build/configs", "rollup.config.client.js"));
};

const buildComponentsForClient = async () => {
    await startRollup(path.join(getConfig().currentDirectory, "build/configs", "rollup.config.client.js"));
};

export {
    startClientDevelopmentBuild,
    buildComponentsForClient
}
