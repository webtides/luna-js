import {getPathToConfigFile, loadSettings} from "@webtides/luna-js/lib/framework/config";
import fs from "fs";

import inquirer from "inquirer";
import path from "path";

const copyEmptyMoonConfig = async () => {
    fs.copyFileSync(path.join(moonCli.currentDirectory, "packages/cli/tasks/prepare", "luna.config.example.js"), getPathToConfigFile(moonCli.currentWorkingDirectory));

    const settings = await loadSettings();

    settings.pagesDirectory.forEach(page => fs.mkdirSync(page, { recursive: true }));
    settings.hooksDirectory.forEach(hook => fs.mkdirSync(hook));
    settings.apisDirectory.forEach(api => fs.mkdirSync(api));
    settings.componentsDirectory.forEach(component => {
        fs.mkdirSync(path.join(component.basePath, component.directory), { recursive: true })
    });

    fs.mkdirSync(path.join(moonCli.currentWorkingDirectory, "views/layouts"), { recursive: true });
    fs.mkdirSync(path.join(moonCli.currentWorkingDirectory, "assets/css"), { recursive: true });

    const filesToCopy = [
        { from: "packages/cli/tasks/prepare/page.example.js", to: path.join(settings.pagesDirectory[0], "index.js") },
        { from: "packages/cli/tasks/prepare/layout.example.js", to: path.join(moonCli.currentWorkingDirectory, "views/layouts", "base.js") },
        { from: "packages/cli/tasks/prepare/assets/main.example.css", to: path.join(moonCli.currentWorkingDirectory, "assets/css", "main.css") },
    ]

    filesToCopy.forEach(({ from, to }) => {
        fs.copyFileSync(path.join(moonCli.currentDirectory, from), to);
    });
};

const checkRequirements = async () => {
    const pathToConfigFile = getPathToConfigFile(moonCli.currentWorkingDirectory);

    if (!fs.existsSync(pathToConfigFile)) {
        console.log("We couldn't detect a luna.config.js in your application directory.");
        const questions = [
            {
                type: "confirm",
                default: false,
                name: "createConfig",
                describe: "Would you like to create a config file?"
            }
        ];

        const result = await inquirer.prompt(questions);
        if (result.createConfig) {
            await copyEmptyMoonConfig();
            return true;
        }

        return false;
    }

    return true;
};

export {checkRequirements};
