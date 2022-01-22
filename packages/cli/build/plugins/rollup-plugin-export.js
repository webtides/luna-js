import  fs  from "fs";
import  path  from "path";
import {getConfig} from "../../src/config";

const minimalPackageJSON = {
    "name": "",
    "description": "",
    "version": "0.1.0",
    "dependencies": {},
    "devDependencies": {}
};

const loadCurrentPackageJSON = () => {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), { encoding: "utf-8" }));
};

const loadMoonPackageJSON = () => {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "node_modules/@webtides/luna-js", "package.json"), { encoding: "utf-8" }));
};

const additionalDependencies = [ "express", "dotenv", "body-parser" ];
if (global.serverlessApiBuild) {
    additionalDependencies.push('serverless-http');
}

export const rollupPluginApiExport = function({ externals, outputDirectory }) {
    return {
        name: 'luna-api-export',

        async writeBundle() {
            const { settings } = getConfig();

            const currentPackageJSON = loadCurrentPackageJSON();
            const moonPackageJSON = loadMoonPackageJSON();
            const exportPackageJSON = { ...minimalPackageJSON };

            const excludedDependencies = settings.export?.api?.excluded ?? [];

            for (const key of Object.keys(currentPackageJSON.dependencies)) {
                if (key === "@webtides/luna-js") {
                    continue;
                }

                if (excludedDependencies.includes(key)) {
                    continue;
                }

                exportPackageJSON.dependencies[key] = currentPackageJSON.dependencies[key];
            }

            for (const key of additionalDependencies) {
                exportPackageJSON.dependencies[key] = moonPackageJSON.dependencies[key];
            }

            exportPackageJSON.version = currentPackageJSON.version;
            exportPackageJSON.name = currentPackageJSON.name;

            fs.writeFileSync(path.join(outputDirectory, "package.json"), JSON.stringify(exportPackageJSON), { encoding: "utf-8" });
        }
    }
}
