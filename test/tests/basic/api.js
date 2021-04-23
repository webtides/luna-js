
const { chai, sleep } = require("../../helpers");
const {basic} = require("./shared/api");

describe("Luna api test", function() {
    this.timeout(10000);

    before(async function() {
        process.chdir(global.getCurrentWorkingDirectory('basic'));

        const { startLuna } = require("../../../packages/luna/lib/framework");

        global.originalConsoleLog = console.log;
        await startLuna();

        await sleep(600);
    });

    after(async function() {
        console.log = global.originalConsoleLog;
        const { stopLuna } = require("../../../packages/luna/lib/framework");
        await stopLuna();
    });

    describe("Basic api tests", function() {
        basic();
    })
});
