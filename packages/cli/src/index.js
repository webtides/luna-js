import "@webtides/luna-js/lib/framework/bootstrap";
import {clearCache} from "@webtides/luna-js/lib/framework/cache/cache";
import { restartServer } from "@webtides/luna-js/lib/framework";
import { initializeLuna } from "@webtides/luna-js/lib/framework/luna";

import {checkRequirements} from "./tasks/prepare";
import {buildComponentsForApplication, startApplicationDevelopmentBuild} from "./tasks/build/application";
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
    const meetsRequirements = await checkRequirements({ setup: argv.setup });

    if (!meetsRequirements) {
        return;
    }

    await initializeLuna();

    if (argv.dev) {
        console.log("Starting luna in development mode.");

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

    if (argv.export) {
        switch (argv.export) {
            case "api":
            case "hybrid":
                await generateAPI({
                    serverless: argv.serverless,
                    withStaticSite: argv.export === "hybrid"
                });
                break;
            default:
                await exportStaticSite();
                break;
        }

        return;
    }

    // Default
    await buildComponentsForApplication();
    startMoonJS();
};

export { execute };
