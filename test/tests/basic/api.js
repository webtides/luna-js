
const { chai, sleep } = require("../../helpers");
const {basic} = require("./shared/api");

describe("Luna api test", function() {
    this.timeout(10000);

    before(async function() {
        process.chdir(global.getCurrentWorkingDirectory('basic'));

        const { startLuna } = require("../../../packages/luna/lib/framework");

        global.originalConsoleLog = console.log;
        await startLuna();

        global.lunaServer = luna.get('LunaServer');

        await sleep(600);
    });

    after(async function() {
        console.log = global.originalConsoleLog;
        await global.lunaServer.stop();
    });

    describe("Basic api tests", function() {
        basic();
    })
});
