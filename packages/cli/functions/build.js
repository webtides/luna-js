import {loadSettings} from "../../framework/config";
import {prepareLegacyBuild} from "./legacy";
import rollup from "rollup";
import loadConfigFile from "rollup/dist/loadConfigFile";
import path from "path";
import {registerAvailableComponents} from "../../framework/loaders/component-loader";
import fs from "fs";


const prebuild = async () => {
    const settings = await loadSettings();

    const availableComponents = (await registerAvailableComponents({generateCssBundles: true}));

    const generatedDirectory = path.join(settings.buildDirectory, "generated");
    if (!fs.existsSync(generatedDirectory)) {
        fs.mkdirSync(generatedDirectory);
    }

    const manifest = {availableComponents};

    fs.writeFileSync(path.join(generatedDirectory, "manifest.json"), JSON.stringify(manifest), {encoding: "utf-8"});
};

const startRollupWatch = async (configFile, callback = () => {
}) => {
    const {options, warnings} = await loadConfigFile(configFile);
    warnings.flush();

    const watcher = rollup.watch(options);
    watcher.on("event", ({code, result}) => {
        switch (code) {
            case "BUNDLE_END":
                result.close();
                return;
            case "START":
                console.log("Compiling client components.");
                break;
            case "END":
                console.log("Client components compiled successfully.");
                callback();
                break;
        }
    });

    console.log("Start watching client components.");
}

const startRollup = async (configFile) => {
    const {options, warnings} = await loadConfigFile(configFile);
    warnings.flush();

    for (const option of options) {
        const bundle = await rollup.rollup(option);

        for (const outputOptions of option.output) {
            await bundle.write(option.output[0]);
        }

        await bundle.close();
    }

}

const startDevelopmentBuilds = async () => {
    startRollupWatch(path.join(global.moon.currentDirectory, "rollup.config.client.js"));
};

const build = async () => {
    const settings = await loadSettings();

    if (settings.legacyBuild) {
        await prepareLegacyBuild();
    }

    await startRollup(path.join(global.moon.currentDirectory, "rollup.config.client.js"));
};

export {
    startDevelopmentBuilds,
    build,
    prebuild
}
