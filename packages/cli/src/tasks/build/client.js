import {loadSettings} from "@webtides/luna-js/lib/framework/config";

import path from "path";
import {prepareLegacyBuild} from "../legacy";
import {startRollup, startRollupWatch} from "../build";

const startClientDevelopmentBuild = () => {
    startRollupWatch(path.join(global.moonCli.currentDirectory, "build/configs", "rollup.config.client.js"));
};

const buildComponentsForClient = async () => {
    const settings = await loadSettings();

    if (settings.build.legacy) {
        await prepareLegacyBuild();
    }

    await startRollup(path.join(global.moonCli.currentDirectory, "build/configs", "rollup.config.client.js"));
};

export {
    startClientDevelopmentBuild,
    buildComponentsForClient
}
