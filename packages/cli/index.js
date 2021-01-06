import {build, startDevelopmentBuilds} from "./functions/build";
import {startWatchingComponentDirectories, startWatchingPagesDirectories} from "./dev/watcher";
import {checkRequirements} from "./functions/prepare";

const startMoonJS = async () => {
    require("../framework").startServer();
};

const execute = async (argv) => {
    const meetsRequirements = await checkRequirements();

    if (!meetsRequirements) {
        return;
    }

    if (argv.dev) {
        console.log("Starting moon in development mode.");

        startDevelopmentBuilds();

        startMoonJS();

        startWatchingPagesDirectories();
        startWatchingComponentDirectories();

        return;
    }

    if (argv.build) {
        await build();
        return;
    }

    if (argv.start) {
        startMoonJS();
        return;
    }

    // Default
    await build();

    startMoonJS();
};

export { execute };
