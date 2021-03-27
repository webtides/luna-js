import {startRollup} from "../build";
import path from "path";
import fs from "fs";
import {loadManifest, loadSettings} from "@webtides/luna-js/lib/framework/config";
import {buildComponentsForApplication} from "../build/application";
import {generateStaticSite} from "./static-site-generator";
import {registerAvailableComponents} from "@webtides/luna-js/lib/framework/loaders/component-loader";

const generateApiEntry = async ({ withStaticSite, serverless } = { }) => {
    const settings = await loadSettings();
    const manifest = await loadManifest();

    const pathToEntry = path.join(
        moonCli.currentDirectory,
        serverless ? "build/entries/api.serverless.js" : "build/entries/api.js"
    );
    let entryBlueprint = fs.readFileSync(pathToEntry, { encoding: "utf-8" });

    const port = settings.port ?? 3005;
    const fallbackApiRoute = settings.api?.fallback ?? false;

    entryBlueprint = entryBlueprint.split("__PORT__").join(port);
    entryBlueprint = entryBlueprint.split("__FALLBACK_API_ROUTE__").join(fallbackApiRoute ? `"${fallbackApiRoute}"` : 'false');

    entryBlueprint = entryBlueprint.split("__SERVE_STATIC_SITE__").join(withStaticSite ? "true" : "false");

    const imports = [];
    let index = 0;
    for (const api of manifest.apis) {
        const {basePath, relativePath, route} = api;

        const pathToApiFile = path.posix.join(basePath, relativePath).split("\\").join("/");
        imports.push(`
            import * as api${index} from "../..${pathToApiFile}";
            apisToRegister.push({
                route: "${route}",
                module: api${index},
            });
        `);

        index++;
    }

    index = 0;
    for (const hook of manifest.hooks) {
        const { basePath, relativePath } = hook;

        const pathToHookFile = path.posix.join(basePath, relativePath).split("\\").join("/");
        imports.push(`
            import * as hook${index} from "../..${pathToHookFile}";
            hooksToRegister.push({
                module: hook${index}
            });
        `);

        index++;
    }

    entryBlueprint = entryBlueprint.split("__IMPORTS__").join(imports.join("\r\n"));

    const buildDirectory = settings._generated.baseDirectory;

    if (!fs.existsSync(buildDirectory)) {
        fs.mkdirSync(buildDirectory)
    }

    fs.writeFileSync(path.join(buildDirectory, "entry.apis.js"), entryBlueprint, {encoding: "utf-8"});
};


const generateAPI = async ({ withStaticSite = false, serverless = false } = { }) => {

    await buildComponentsForApplication();
    console.log("Generate api entry file.");
    await generateApiEntry({ withStaticSite, serverless });
    console.log("Generate api...");

    if (serverless) {
        global.serverlessApiBuild = true;
    }

    await startRollup(path.join(moonCli.currentDirectory, "build/configs/rollup.config.api.js"));


    if (withStaticSite) {
        const settings = await loadSettings();

        const outputDirectory = settings.export.apiOutputDirectory ?? settings.export.outputDirectory;

        await registerAvailableComponents();
        await generateStaticSite({
            outputDirectory
        });
    }
};

export { generateAPI };
