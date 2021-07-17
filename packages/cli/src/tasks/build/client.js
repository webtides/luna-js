import {loadSettings} from "@webtides/luna-js/src/framework/config";

import path from "path";
import {prepareLegacyBuild} from "../legacy";
import {startRollup, startRollupWatch} from "../build";
import {getConfig} from "../../config";

const startClientDevelopmentBuild = () => {
    startRollupWatch(path.join(getConfig().currentDirectory, "build/configs", "rollup.config.client.js"));
};

const buildComponentsForClient = async () => {
    const settings = await loadSettings();

    if (settings.build.legacy) {
        await prepareLegacyBuild();
    }

    await startRollup(path.join(getConfig().currentDirectory, "build/configs", "rollup.config.client.js"));
};

export {
    startClientDevelopmentBuild,
    buildComponentsForClient
}
