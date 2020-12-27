const path = require("path");
const child_process = require('child_process');
(() => {

    const variables = {
        configName: "previous.config.js"
    };

    const workingDirectory = process.cwd();

    global.elementJSConfig = require(path.join(workingDirectory, variables.configName));

    child_process.execSync(`cd node_modules/previous.js && npm run start -- --pagesDir ${workingDirectory}/app/pages`, {stdio: [0, 1, 2]}, (error, stdout, stderr) => {
        console.log(stdout);
    });

})();
