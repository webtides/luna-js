import {registerAvailableComponents} from "../../framework/loaders/component-loader";
import {loadSettings} from "../../framework/config";
const exec = require('child_process').exec;
const path = require("path");
const fs = require("fs");

const prepareForDocker = async () => {
    const settings = await loadSettings();

    const availableComponents = (await registerAvailableComponents({generateCssBundles: true}));

    const generatedDirectory = path.join(settings.buildDirectory, "generated");
    if (!fs.existsSync(generatedDirectory)) {
        fs.mkdirSync(generatedDirectory);
    }

    const manifest = {availableComponents};

    fs.writeFileSync(path.join(generatedDirectory, "manifest.json"), JSON.stringify(manifest), {encoding: "utf-8"});
};

const publishDockerFile = async () => {
    fs.copyFileSync(path.resolve(moon.currentDirectory, "packages/cli/docker/Dockerfile"), path.join(moon.currentWorkingDirectory, "Dockerfile"));
    fs.copyFileSync(path.resolve(moon.currentDirectory, "packages/cli/docker/.dockerignore"), path.join(moon.currentWorkingDirectory, ".dockerignore"));
};


export { publishDockerFile, prepareForDocker };
