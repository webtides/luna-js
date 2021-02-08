const fs = require("fs");
const path = require("path");

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
    return JSON.parse(fs.readFileSync(path.join(__dirname, "../..", "package.json"), { encoding: "utf-8" }));
};

const additionalDependencies = [ "express", "dotenv", "body-parser" ];
if (global.serverlessApiBuild) {
    additionalDependencies.push('serverless-http');
}

module.exports =  function({ externals, outputDirectory }) {

    return {
        name: 'moon-api-export',

        async writeBundle() {
            const currentPackageJSON = loadCurrentPackageJSON();
            const moonPackageJSON = loadMoonPackageJSON();
            const exportPackageJSON = { ...minimalPackageJSON };

            for (const key of Object.keys(currentPackageJSON.dependencies)) {
                if (key === "@webtides/moon-js") {
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
