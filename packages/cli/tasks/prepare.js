import {getPathToConfigFile, loadSettings} from "../../framework/config";
import fs from "fs";

import inquirer from "inquirer";
import path from "path";

const copyEmptyMoonConfig = async () => {
    fs.copyFileSync(path.join(moon.currentDirectory, "moon.config.example.js"), getPathToConfigFile(moon.currentWorkingDirectory));

    const settings = await loadSettings();

    settings.pagesDirectory.forEach(page => fs.mkdirSync(page));
    settings.hooksDirectory.forEach(hook => fs.mkdirSync(hook));
    settings.apisDirectory.forEach(api => fs.mkdirSync(api));
    settings.componentsDirectory.forEach(component => fs.mkdirSync(path.join(component.basePath, component.directory)));

    fs.copyFileSync(path.join(moon.currentDirectory, "packages/cli/tasks", "prepare/page.example.js"), path.join(settings.pagesDirectory[0], "index.js"));
};

const checkRequirements = async () => {
    const pathToConfigFile = getPathToConfigFile(moon.currentWorkingDirectory);

    if (!fs.existsSync(pathToConfigFile)) {
        console.log("We couldn't detect a moon.config.js in your application directory.");
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
