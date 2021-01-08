import path from "path";
import fs from "fs";

let _hasManifest;


const hasManifest = async () => {
    if (typeof _hasManifest === "undefined") {
        const settings = await loadSettings();

        if (fs.existsSync(path.join(settings.buildDirectory, "generated", "manifest.json"))) {
            _hasManifest = true;
        } else {
            _hasManifest = false;
        }
    }

    return _hasManifest;
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
            pagesDirectory: path.join(settings.buildDirectory, "generated", "pages")
        }

        return settings;

    } catch (error) {
        console.error(error);
        return false;
    }
};

export { getPathToConfigFile, loadSettings, hasManifest };
