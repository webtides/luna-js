import "../framework/bootstrap";
import {checkRequirements} from "./tasks/prepare";
import { publishDockerFile} from "./tasks/docker";
import {buildComponentsForApplication, startApplicationDevelopmentBuild} from "./tasks/build/application";
import {clearCache} from "../framework/cache/cache";
import { restartServer } from "../framework";
import exportStaticSite from "./tasks/export";
import {generateAPI} from "./tasks/export/api-generator";

let moonJSStarting = false;

const startMoonJS = async () => {
    if (moonJSStarting) return;
    moonJSStarting = true;

    await restartServer();

    moonJSStarting = false;
};

const execute = async (argv) => {
    const meetsRequirements = await checkRequirements();

    if (!meetsRequirements) {
        return;
    }

    if (argv.dev) {
        console.log("Starting moon in development mode.");

        startApplicationDevelopmentBuild(() => {
            clearCache();
            startMoonJS();
        });

        return;
    }

    if (argv.build) {
        await buildComponentsForApplication();
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

    if (argv.export) {
        if (argv.api) {
            await generateAPI();
        } else if (argv.hybrid) {
            await generateAPI({
                withStaticSite: true
            });
        } else {
            exportStaticSite();
        }

        return;
    }

    // Default
    await buildComponentsForApplication();
    startMoonJS();
};

export { execute };
