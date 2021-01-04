const {pascalCase} = require("pascal-case");
const path = require("path");
const fs = require("fs");
const glob = require("glob-all");

(() => {

    const variables = {
        configName: "moon.config.js"
    };

    const workingDirectory = process.cwd();
    const settings = require(path.join(workingDirectory, variables.configName));

    const componentsDirectory = settings.componentsDirectory.map(bundle => {
        return path.join(workingDirectory, bundle.basePath, "**/*.js")
    });

    const generateEntryFile = () => {
        const elements = glob.sync(componentsDirectory)

        const contents = `
            // TODO: use core-js in near future
            Object.defineProperty(Array.prototype, "includes", {
                value: function(searchElement, fromIndex) {
                    return this.indexOf(searchElement) !== -1;
                }
            });
            
            ${elements.map(element => {
                const elementName = element.split("/").pop().split(".js")[0];
                const className = pascalCase(elementName);
                
                return `
                    import ${className} from "${element}";
                    customElements.define("${elementName}", ${className});
                `;
            }).join("\n\r")}
        `;

        const buildDirectory = path.join(__dirname, "..", "lib");

        if (!fs.existsSync(buildDirectory)) {
            fs.mkdirSync(buildDirectory)
        }

        fs.writeFileSync(path.join(buildDirectory, "entry.legacy.js"), contents, { encoding: "utf-8" });
    };

    generateEntryFile();

    // child_process.execSync(`cd node_modules/previous.js && npm run start -- --pagesDir ${workingDirectory}/app/pages`, {stdio: [0, 1, 2]}, (error, stdout, stderr) => {
    //     console.log(stdout);
    // });

})();
