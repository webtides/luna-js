const { chai, sleep } = require("../helpers");

process.chdir(global.currentWorkingDirectory);

describe("Luna element test", function() {
    this.timeout(10000);

    before(async function() {

        const { startServer } = require("../../packages/luna/lib/framework");

        global.originalConsoleLog = console.log;
        await startServer();

        await sleep(600);
    });

    after(async function() {
        const { stopServer } = require("../../packages/luna/lib/framework");
        console.log = global.originalConsoleLog;
        await stopServer();
    });

    describe("Basic component tests", function() {
        it("renders the component on the server", async function() {
            const response = await chai.request('http://localhost:3010').get('/rendering').send();
            chai.expect(response.text).to.include('MOCHA COMPONENT')
        });

        it("doesn't render the no-ssr-component on the server", async function() {
            const response = await chai.request('http://localhost:3010').get('/rendering').send();
            chai.expect(response.text).to.not.include('NO SSR COMPONENT')
            chai.expect(response.text).to.include('<no-ssr-component')
        });

        it("loads the dependencies of no ssr components", async function() {
            const response = await chai.request('http://localhost:3010').get('/rendering').send();
            chai.expect(response.text).to.include('/client-component.js')
        });
    });

    describe("Special cases", function() {
        it("doesn't include the legacy bundle", async function() {
            const response = await chai.request('http://localhost:3010').get('/rendering').send();
            chai.expect(response.text).to.not.include('bundle.legacy.js')
        })
    })
});
