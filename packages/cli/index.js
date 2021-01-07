import {build, startDevelopmentBuilds} from "./functions/build";
import {startWatchingComponentDirectories, startWatchingPagesDirectories} from "./functions/watcher";
import {checkRequirements} from "./functions/prepare";
import {prepareForDocker, publishDockerFile} from "./functions/docker";

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
        await prepareForDocker();
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
