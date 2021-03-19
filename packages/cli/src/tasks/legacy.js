import {loadManifest, loadSettings} from "@webtides/luna-js/lib/framework/config";

import path from "path";
import fs from "fs";
import {pascalCase} from "pascal-case";

const prepareLegacyBuild = async () => {
    console.log("Generate entry file");

    const settings = await loadSettings();

    const generateEntryFile = async () => {
        let contents = ``;

        const manifest = await loadManifest();

        let code = [];

        for (const component of manifest.components) {
            const {basePath, relativePath} = component;

            const elementName = relativePath.split("/").pop().split(".js")[0];
            const className = pascalCase(elementName);

            code.push(`
               import ${className} from "../..${basePath}${relativePath}";
               customElements.define("${elementName}", ${className});
           `);
        }

        contents += code.join("\r\n");

        const buildDirectory = settings._generated.baseDirectory;

        if (!fs.existsSync(buildDirectory)) {
            fs.mkdirSync(buildDirectory)
        }

        fs.writeFileSync(path.join(buildDirectory, "entry.legacy.js"), contents, {encoding: "utf-8"});
    };

    await generateEntryFile();
};

export { prepareLegacyBuild };
