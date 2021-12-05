import path from 'path';

import {checkRequirements} from "./tasks/prepare";
import {
    buildComponentsForApplication,
    startApplicationDevelopmentBuild
} from "./tasks/build/application";
import exportStaticSite from "./tasks/export";
import {generateAPI} from "./tasks/export/api-generator";
import {setConfig} from "./config";
import {startLunaJS} from "./run";

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

    // Not the recommended way to start luna like this, as there
    // is a big overhead for using @babel/register and other
    // helper functions for the cli.
    if (argv.start) {
        await startLunaJS();
        return;
    }

    if (argv.dev) {
        console.log("Starting luna in development mode.");

        await startApplicationDevelopmentBuild(async () => {
            await startLunaJS();
        });

        return;
    }

    if (argv.build) {
        await buildComponentsForApplication();
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
