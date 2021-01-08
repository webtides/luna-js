import path from "path";
import fs from "fs";


const publishDockerFile = async () => {
    fs.copyFileSync(path.resolve(moon.currentDirectory, "packages/cli/tasks/docker/Dockerfile"), path.join(moon.currentWorkingDirectory, "Dockerfile"));
    fs.copyFileSync(path.resolve(moon.currentDirectory, "packages/cli/tasks/docker/.dockerignore"), path.join(moon.currentWorkingDirectory, ".dockerignore"));
};


export { publishDockerFile };
