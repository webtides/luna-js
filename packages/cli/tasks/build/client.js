import path from "path";
import {loadSettings} from "../../../framework/config";
import {prepareLegacyBuild} from "../legacy";
import {startRollup, startRollupWatch} from "../build";

const startClientDevelopmentBuild = () => {
    startRollupWatch(path.join(global.moon.currentDirectory, "build/configs", "rollup.config.client.js"));
};

const buildComponentsForClient = async () => {
    const settings = await loadSettings();

    if (settings.legacyBuild) {
        await prepareLegacyBuild();
    }

    await startRollup(path.join(global.moon.currentDirectory, "build/configs", "rollup.config.client.js"));
};

export {
    startClientDevelopmentBuild,
    buildComponentsForClient
}
