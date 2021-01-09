import path from "path";
import fs from "fs";


const loadManifest = async () => {
    const settings = await loadSettings();

    const pathToManifest = path.join(settings.buildDirectory, "generated", "manifest.json");

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
        const settings = (await import(path.join(process.cwd(), "moon.config.js"))).default;

        settings.componentsDirectory = settings.componentsDirectory.map(bundle => {
            bundle._generated = {
                basePath: path.join(settings.buildDirectory, "generated", "components")
            }

            return bundle;
        });

        settings._generated = {
            pagesDirectory: path.join(settings.buildDirectory, "generated", "pages"),
            componentsDirectory: path.join(settings.buildDirectory, "generated", "pages"),
            manifest: path.join(settings.buildDirectory, "generated", "manifest.json")
        }

        return settings;

    } catch (error) {
        console.error(error);
        return false;
    }
};

export { getPathToConfigFile, loadSettings, loadManifest };
