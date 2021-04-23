import "@webtides/luna-js/lib/framework/bootstrap";
import { prepareLuna } from "@webtides/luna-js/lib/framework/luna";
import {startLuna} from "@webtides/luna-js/lib/framework";

import {checkRequirements} from "./tasks/prepare";
import {buildComponentsForApplication, startApplicationDevelopmentBuild} from "./tasks/build/application";
import exportStaticSite from "./tasks/export";
import {generateAPI} from "./tasks/export/api-generator";
import {sendReloadMessage, startLivereloadServer} from "./tasks/build/livereload";
import LunaCache from "@webtides/luna-js/lib/framework/cache/luna-cache";

let moonJSStarting = false;

const restartLunaJS = async () => {
    if (moonJSStarting) return;
    moonJSStarting = true;

    const server = luna.get('LunaServer');
    await server.restart();

    moonJSStarting = false;
};

const execute = async (argv) => {
    const meetsRequirements = await checkRequirements({ setup: argv.setup });

    if (!meetsRequirements) {
        return;
    }

    await prepareLuna();

    if (argv.dev) {
        console.log("Starting luna in development mode.");

        await startLuna();

        await startLivereloadServer();
        await startApplicationDevelopmentBuild(async () => {
            luna.get(LunaCache).clear();
            await restartLunaJS();
            await sendReloadMessage();
        });

        return;
    }

    if (argv.build) {
        await buildComponentsForApplication();
        return;
    }

    if (argv.start) {
        await startLuna();
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
    startLunaJS();
};

export { execute };
