
const { chai, sleep } = require("../../helpers");
const {basic} = require("./shared/api");

describe("Luna api test", function() {
    this.timeout(10000);

    before(async function() {
        process.chdir(global.getCurrentWorkingDirectory('basic'));
        const {startLunaJS} = require("../../../packages/cli/src/run");

        global.originalConsoleLog = console.log;
        await startLunaJS();

        await sleep(600);
    });

    after(async function() {
        console.log = global.originalConsoleLog;
        const {stopLunaJS} = require("../../../packages/cli/src/run");
        await stopLunaJS();
    });

    describe("Basic api tests", function() {
        basic();
    })
});
