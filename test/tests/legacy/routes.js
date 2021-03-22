const { chai, sleep } = require("../../helpers");

describe("Luna legacy routes test", function() {
    this.timeout(20000);

    before(async function() {
        process.chdir(global.getCurrentWorkingDirectory('legacy'));

        global.originalConsoleLog = console.log;

        const { startServer } = require("../../../packages/luna/lib/framework");
        await startServer();

        await sleep(600);

        console.log("STARTED THE SERVER");
    });

    after(async function() {
        const { stopServer } = require("../../../packages/luna/lib/framework");
        await stopServer();

        console.log = global.originalConsoleLog;
    });

    describe("Polyfills in response", function() {
        it("appends the polyfills to the html document", async function() {
            const response = await chai.request('http://localhost:3010').get('/').send();

            chai.expect(response.text).to.include("/libraries/webcomponents-bundle.js");
        });
    })
});
