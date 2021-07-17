import path from 'path';

import "@webtides/luna-js/src/framework/bootstrap";
import LunaCache from "@webtides/luna-js/src/framework/cache/luna-cache";
import { prepareLuna } from "@webtides/luna-js/src/framework";
import {startLuna} from "@webtides/luna-js/src/framework";

import {checkRequirements} from "./tasks/prepare";
import {
    buildComponentsForApplication,
    buildEntryPointForProduction,
    startApplicationDevelopmentBuild
} from "./tasks/build/application";
import exportStaticSite from "./tasks/export";
import {generateAPI} from "./tasks/export/api-generator";
import {sendReloadMessage, startLivereloadServer} from "./tasks/build/livereload";
import ComponentLoader from "@webtides/luna-js/src/framework/loaders/component-loader";
import {setConfig} from "./config";

let moonJSStarting = false;

const restartLunaJS = async () => {
    if (moonJSStarting) return;
    moonJSStarting = true;

    luna.get(LunaCache).clear();
    await luna.get(ComponentLoader).registerAvailableComponents();

    const server = luna.get('LunaServer');
    await server.reset();

    moonJSStarting = false;
};

const execute = async (argv) => {
    setConfig({
        currentWorkingDirectory: process.cwd(),
        currentDirectory: path.dirname(__dirname),
        isExporting: !!argv.export,
        documentInject: ''
    });

    const meetsRequirements = await checkRequirements({ setup: argv.setup });

    if (!meetsRequirements) {
        return;
    }

    await prepareLuna();

    if (argv.dev) {
        await buildComponentsForApplication();

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
        await buildEntryPointForProduction();
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
