const {chai, sleep} = require("../../helpers");

describe("Luna hooks test", function () {
    this.timeout(10000);

    before(async function () {
        process.chdir(global.currentWorkingDirectory);

        global.originalConsoleLog = console.log;
    });

    after(function () {
        console.log = global.originalConsoleLog;
    });

    describe("Hooks Registration", function () {
        it("should call the startup hooks in the right order", function (done) {
            const calledHooks = [];

            const {startServer, stopServer} = require("../../../packages/luna/lib/framework");

            const assertHooks = () => {
                chai.assert.deepEqual(calledHooks, [
                    'HOOKS.LUNA_INITIALIZE',
                    'HOOKS.HOOKS_LOADED',
                    'HOOKS.COMPONENTS_LOADED',
                    'HOOKS.ROUTES_BEFORE_REGISTER',
                    'HOOKS.MIDDLEWARE_REGISTER',
                    'HOOKS.ROUTES_AFTER_REGISTER',
                    'HOOKS.SERVER_STARTED'
                ]);

                stopServer();

                done();
            }

            console.log = (text) => {
                if (typeof text !== "string") {
                    return;
                }

                if (text.indexOf("HOOKS.") === 0) {
                    calledHooks.push(text.trim());
                }

                if (text.indexOf("HOOKS.SERVER_STARTED") === 0) {
                    assertHooks();
                }
            };

            startServer();
        });

        it('should call the request hook', function (done) {
            const {startServer, stopServer} = require("../../../packages/luna/lib/framework");

            console.log = text => {
                if (text === 'HOOKS.REQUEST_RECEIVED') {
                    stopServer();
                    done();
                }
            };

            startServer()
                .then(() => sleep(300))
                .then(() =>  chai.request('http://localhost:3010').get('/').send());
        });
    });


});
