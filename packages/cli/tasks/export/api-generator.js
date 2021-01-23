import {startRollup} from "../build";
import path from "path";
import fs from "fs";
import {loadManifest, loadSettings} from "../../../framework/config";
import {buildComponentsForApplication} from "../build/application";

const generateApiEntry = async () => {
    const settings = await loadSettings();
    const manifest = await loadManifest();

    const pathToEntry = path.join(moon.currentDirectory, "build/entries/api.js");
    let entryBlueprint = fs.readFileSync(pathToEntry, { encoding: "utf-8" });

    const port = settings.port ?? 3005;
    const fallbackApiRoute = settings.fallbackApiRoute ?? false;

    entryBlueprint = entryBlueprint.split("__PORT__").join(port);
    entryBlueprint = entryBlueprint.split("__FALLBACK_API_ROUTE__").join(fallbackApiRoute ? `"${fallbackApiRoute}"` : 'false');

    const imports = [];
    let index = 0;
    for (const api of manifest.apis) {
        const {basePath, relativePath} = api;

        const apiRoute = relativePath.split(".js")[0];

        const pathToApiFile = path.posix.join(moon.currentWorkingDirectory, basePath, relativePath).split("\\").join("/");
        imports.push(`
            import * as api${index} from "${pathToApiFile}";
            apisToRegister.push({
                name: "${apiRoute}",
                module: api${index}
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


const generateAPI = async () => {
    await buildComponentsForApplication();
    console.log("Generate api entry file.");
    await generateApiEntry();
    console.log("Generate api...");
    await startRollup(path.join(moon.currentDirectory, "build/configs/rollup.config.api.js"));
};

export { generateAPI };
