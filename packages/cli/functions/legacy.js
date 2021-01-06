import { pascalCase } from "pascal-case";
import path from "path";
import fs from "fs";
import glob from "glob";
import {loadSettings} from "../../framework/config";

const prepareLegacyBuild = async () => {
    const settings = await loadSettings();

    const generateEntryFile = () => {
        let contents = `
            // TODO: use core-js in near future
            Object.defineProperty(Array.prototype, "includes", {
                value: function(searchElement, fromIndex) {
                    return this.indexOf(searchElement) !== -1;
                }
            });
        `;

        settings.componentsDirectory.map(bundle => {
            const elements = glob.sync(path.join(bundle.basePath, "**/*.js"));
            const relativePath = bundle.outputDirectory.substring(settings.publicDirectory.length);

            contents += elements.map(element => {
                const elementName = element.split("/").pop().split(".js")[0];
                const className = pascalCase(elementName);

                return `
                   import ${className} from "${relativePath}/${elementName}.js";
                   customElements.define("${elementName}", ${className});
               `;
            }).join("\n\r");
        });


        const buildDirectory = path.join(__dirname, "..", "lib");

        if (!fs.existsSync(buildDirectory)) {
            fs.mkdirSync(buildDirectory)
        }

        fs.writeFileSync(path.join(buildDirectory, "entry.legacy.js"), contents, {encoding: "utf-8"});
    };

    generateEntryFile();
};

export { prepareLegacyBuild };
