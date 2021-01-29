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
}

module.exports =  function({ externals, outputDirectory }) {

    return {
        name: 'moon-api-export',

        async writeBundle() {
            const currentPackageJSON = loadCurrentPackageJSON();
            const exportPackageJSON = { ...minimalPackageJSON };

            for (const external of externals) {
                if (currentPackageJSON.dependencies[external]) {
                    exportPackageJSON.dependencies[external] = currentPackageJSON.dependencies[external];
                }
            }

            fs.writeFileSync(path.join(outputDirectory, "package.json"), JSON.stringify(exportPackageJSON), { encoding: "utf-8" });
        }
    }
}
