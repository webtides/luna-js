import {build, prebuild, startDevelopmentBuilds} from "./tasks/build";
import {startWatchingComponentDirectories, startWatchingPagesDirectories} from "./tasks/watcher";
import {checkRequirements} from "./tasks/prepare";
import { publishDockerFile} from "./tasks/docker";

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
        await prebuild();
        await build();
        return;
    }

    if (argv.start) {
        startMoonJS();
        return;
    }

    if (argv.dockerfile) {
        publishDockerFile();
        return;
    }

    // Default
    await build();

    startMoonJS();
};

export { execute };
