const child_process = require('child_process');
(() => {
    child_process.execSync(`npm run compile`, {stdio: [0, 1, 2]}, (error, stdout, stderr) => {
        console.log(stdout);
    });
})();
