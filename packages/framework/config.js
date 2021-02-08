import path from "path";
import fs from "fs";

const loadManifest = async (filename = "manifest.json") => {
    const settings = await loadSettings();

    const pathToManifest = path.join(settings.buildDirectory, "generated", filename);

    if (fs.existsSync(pathToManifest)) {
        return JSON.parse(fs.readFileSync(pathToManifest, { encoding: "utf-8" }));
    }

    return false;
};

const getPathToConfigFile = (currentWorkingDirectory = process.cwd()) => {
    return path.join(currentWorkingDirectory, "moon.config.js");
}

const loadSettings = async () => {
    try {
        const settings = (await import(getPathToConfigFile())).default;

        settings.componentsDirectory = settings.componentsDirectory.map(bundle => {
            bundle._generated = {
                basePath: path.join(settings.buildDirectory, "generated", "components")
            }

            return bundle;
        });

        settings._generated = {
            baseDirectory: path.join(settings.buildDirectory, "generated"),
            applicationDirectory: path.join(settings.buildDirectory, "generated", "application"),
            manifest: path.join(settings.buildDirectory, "generated", "manifest.json"),
            clientManifest: path.join(settings.buildDirectory, "generated", "manifest.client.json"),
        }

        return settings;

    } catch (error) {
        console.error(error);
        return false;
    }
};

export { getPathToConfigFile, loadSettings, loadManifest };
