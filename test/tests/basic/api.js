const { chai, sleep } = require("../../helpers");
const {basic} = require("./shared/api");

describe("Luna api test", function() {
    this.timeout(10000);

    before(async function() {
        process.chdir(global.getCurrentWorkingDirectory('basic'));

        const { startServer } = require("../../../packages/luna/lib/framework");

        global.originalConsoleLog = console.log;
        await startServer();

        await sleep(600);
    });

    after(async function() {
        const { stopServer } = require("../../../packages/luna/lib/framework");
        console.log = global.originalConsoleLog;
        await stopServer();
    });

    describe("Basic api tests", function() {
        basic();
    })
});
