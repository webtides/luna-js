import {build, startDevelopmentBuilds} from "./functions/build";
import {startWatchingComponentDirectories, startWatchingPagesDirectories} from "./functions/watcher";
import {checkRequirements} from "./functions/prepare";
import {prepareForDocker} from "./functions/docker";

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

    if (argv.docker) {
        await build();
        await prepareForDocker();
        return;
    }

    // Default
    await build();

    startMoonJS();
};

export { execute };
