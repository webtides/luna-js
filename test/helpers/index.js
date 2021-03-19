const {spawn, execSync} = require("child_process");

const chai = require("chai");
chai.use(require("chai-fs"));
chai.use(require("chai-http"));

const BUILD_SCRIPT = 'node node_modules/@webtides/luna-cli/.bin/luna.js'
const LUNA_CLI_SCRIPT = 'node_modules/@webtides/luna-cli/.bin/luna.js'

const LUNA_START_SCRIPT = 'node_modules/@webtides/luna-js/start';

const execute = (cmd) => {
    return execSync(cmd, { stdio: 'inherit' });
};

if (!global.currentWorkingDirectory) {
    global.currentWorkingDirectory = process.cwd();
}

const startLuna = ({ onStart, onMessage } = { }) => {

    const child = spawn(`node`, [LUNA_START_SCRIPT]);

    child.stdout.on('data', (data) => {
        if (data.indexOf('luna-js listening at') !== -1) {
            onStart && onStart();
        }

        onMessage && onMessage();
    });

    return () => {
        child.stdin.pause();
        child.kill();
    };
}

module.exports = {
    BUILD_SCRIPT,
    LUNA_CLI_SCRIPT,
    LUNA_START_SCRIPT,
    startLuna,
    execute,
    chai
};
