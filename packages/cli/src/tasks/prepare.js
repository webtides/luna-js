import {getPathToConfigFile, loadSettings} from "@webtides/luna-js/src/framework/config";
import fs from "fs";

import inquirer from "inquirer";
import path from "path";

const copyEmptyMoonConfig = async () => {
    fs.copyFileSync(path.join(lunaCli.currentDirectory, "src/tasks/prepare", "luna.config.example.js"), getPathToConfigFile(lunaCli.currentWorkingDirectory));

    const settings = await loadSettings();

    settings.pages?.input?.forEach(page => fs.mkdirSync(page, { recursive: true }));
    settings.hooks?.input?.forEach(hook => fs.mkdirSync(hook));
    settings.api?.input?.forEach(api => fs.mkdirSync(api));
    settings.components?.bundles.forEach(component => {
        fs.mkdirSync(component.input, { recursive: true })
    });

    fs.mkdirSync(path.join(lunaCli.currentWorkingDirectory, "views/layouts"), { recursive: true });
    fs.mkdirSync(path.join(lunaCli.currentWorkingDirectory, "assets/css"), { recursive: true });

    const filesToCopy = [
        { from: "src/tasks/prepare/page.example.js", to: path.join(settings.pages.input[0], "index.js") },
        { from: "src/tasks/prepare/component.example.js", to: path.join(settings.components.bundles[0].input, "example-component.js") },
        { from: "src/tasks/prepare/layout.example.js", to: path.join(lunaCli.currentWorkingDirectory, "views/layouts", "base.js") },
        { from: "src/tasks/prepare/assets/main.example.css", to: path.join(lunaCli.currentWorkingDirectory, "assets/css", "main.css") },
    ]

    filesToCopy.forEach(({ from, to }) => {
        fs.copyFileSync(path.join(lunaCli.currentDirectory, from), to);
    });
};

const checkRequirements = async ({ setup } = { setup: false }) => {
    const pathToConfigFile = getPathToConfigFile(lunaCli.currentWorkingDirectory);

    if (!fs.existsSync(pathToConfigFile)) {
        console.log("We couldn't detect a luna.config.js in your application directory.");
        let result;

        if (!setup) {
            const questions = [
                {
                    type: "confirm",
                    default: false,
                    name: "createConfig",
                    describe: "Would you like to create a config file?"
                }
            ];

            result = await inquirer.prompt(questions);
        }

        if (setup || result?.createConfig) {
            await copyEmptyMoonConfig();
            return true;
        }

        return false;
    }

    return true;
};

export {checkRequirements};
