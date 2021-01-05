import {build, startDevelopmentBuilds} from "./functions/build";
import {startWatchingPagesDirectories} from "./dev/watcher";

const startMoonJS = async () => {
    require("../framework");
};

const execute = async (argv) => {
    if (argv.dev) {
        console.log("Starting moon in development mode.");

        startDevelopmentBuilds();

        startMoonJS();

        startWatchingPagesDirectories();
        startWatchingPagesDirectories();

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
