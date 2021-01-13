import path from "path";
import fs from "fs";
import glob from "glob";
import {loadManifest, loadSettings} from "../../framework/config";
import {pascalCase} from "pascal-case";

const prepareLegacyBuild = async () => {
    console.log("Generate entry file");

    const settings = await loadSettings();

    const generateEntryFile = async () => {

        let contents = `
            import "moon.js/packages/client/libraries/runtime.js";
            
            // TODO: use core-js in near future
            Object.defineProperty(Array.prototype, "includes", {
                value: function(searchElement, fromIndex) {
                    return this.indexOf(searchElement) !== -1;
                }
            });
        `;

        const basePath = settings._generated.applicationDirectory;
        const manifest = await loadManifest();

        let code = [];

        for (const component of manifest.components) {
            const {file, basePath, relativePath, settings, children} = component;

            const elementName = relativePath.split("/").pop().split(".js")[0];
            const className = pascalCase(elementName);

            code.push(`
               import ${className} from "../..${basePath}${relativePath}";
               customElements.define("${elementName}", ${className});
           `);
        }

        contents += code.join("\r\n");

        const buildDirectory = path.join(settings.buildDirectory, "generated");

        if (!fs.existsSync(buildDirectory)) {
            fs.mkdirSync(buildDirectory)
        }

        fs.writeFileSync(path.join(buildDirectory, "entry.legacy.js"), contents, {encoding: "utf-8"});
    };

    await generateEntryFile();
};

export { prepareLegacyBuild };
