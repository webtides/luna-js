import path from "path";

const getPathToConfigFile = (currentWorkingDirectory = process.cwd()) => {
    return path.join(currentWorkingDirectory, "moon.config.js");
}

const loadSettings = async () => {
    try {
        return (await import(path.join(process.cwd(), "moon.config.js"))).default;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export { getPathToConfigFile, loadSettings };
