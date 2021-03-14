import path from "path";
import fs from "fs";

let settings = false;

const defaultSettings = {
    port: 3005,
    api: {
        domain: false,
        context: '/api'
    },
    assets: {
        domain: false,
        context: ''
    },
    routes: {
        cacheable: []
    }
};

const normalizeDomainAndContext = ({ domain, context }) => {
    context = context || '';

    if (context.endsWith("/")) {
        context = context.substring(0, context.length - 1);
    }

    if (context.length > 0 && !context.startsWith("/")) {
        context = `/${context}`;
    }

    domain = domain || '';

    if (domain.endsWith("/")) {
        domain = domain.substring(0, domain.length - 1);
    }

    return { context, domain };
};

const loadManifest = async (filename = "manifest.json") => {
    const settings = await loadSettings();

    const pathToManifest = path.join(settings.buildDirectory, "generated", filename);

    if (fs.existsSync(pathToManifest)) {
        return JSON.parse(fs.readFileSync(pathToManifest, { encoding: "utf-8" }));
    }

    return false;
};

const getPathToConfigFile = (currentWorkingDirectory = process.cwd()) => {
    return path.join(currentWorkingDirectory, "luna.config.js");
}

const loadSettings = async () => {
    if (settings) {
        return settings;
    }

    try {
        settings = Object.assign({}, defaultSettings, (await import(getPathToConfigFile())).default);

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

        /*
         * The cli sets the global flag moonIsExporting if the user initialized an export.
         * Here we override the api and assets settings with the specific export settings.
         */
        if (typeof global.moonIsExporting !== 'undefined' && global.moonIsExporting === true) {
            settings.api = Object.assign(settings.api, settings.export?.api ?? {});
            settings.assets = Object.assign(settings.assets, settings.export?.assets ?? {});
        }

        settings.api = normalizeDomainAndContext(settings.api);
        settings.assets = normalizeDomainAndContext(settings.assets);

        return settings;

    } catch (error) {
        console.error(error);
        return false;
    }
};

const getSettings = () => settings;

const getSerializableConfig = () => {
    if (!settings) {
        return false;
    }

    return {
        assets: {
            domain: settings.assets.domain,
            context: settings.assets.context,
        },

        api: {
            domain: settings.api.domain,
            context: settings.api.context,
        }
    }
};

export { getPathToConfigFile, getSettings, loadSettings, loadManifest, getSerializableConfig };
