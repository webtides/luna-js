import {build, startDevelopmentBuilds} from "./functions/build";

const execute = async (argv) => {
    if (argv.dev) {
        console.log("Starting moon in development mode.");
        startDevelopmentBuilds();

        require("../framework/entry.js");
        return;
    }

    if (argv.build) {
        await build();
        return;
    }

    if (argv.start) {
        require("../framework/entry.js");
        return;
    }

    // Default
    await build();

    require("../framework/entry.js");
};

export { execute };
