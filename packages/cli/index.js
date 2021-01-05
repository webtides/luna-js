import {build, startDevelopmentBuilds} from "./functions/build";
import {startWatchingComponentDirectories, startWatchingPagesDirectories} from "./dev/watcher";

const startMoonJS = async () => {
    require("../framework");
};

const execute = async (argv) => {
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
