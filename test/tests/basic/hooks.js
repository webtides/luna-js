const {chai, sleep} = require("../../helpers");

describe("Luna hooks test", function () {
    this.timeout(10000);

    before(async function () {

        process.chdir(global.getCurrentWorkingDirectory('basic'));

        global.originalConsoleLog = console.log;
    });

    after(function () {
        console.log = global.originalConsoleLog;
    });

    describe("Hooks Registration", function () {
        it("should call the startup hooks in the right order", function (done) {
            const calledHooks = [];

            const {startLuna, stopLuna} = require("../../../packages/luna/src/framework");

            const assertHooks = () => {
                chai.assert.deepEqual(calledHooks, [
                    'HOOKS.LUNA_INITIALIZE',
                    'HOOKS.HOOKS_LOADED',
                    'HOOKS.COMPONENTS_LOADED',
                    'HOOKS.MIDDLEWARE_REGISTER',
                    'HOOKS.ROUTES_BEFORE_REGISTER',
                    'HOOKS.ROUTES_AFTER_REGISTER',
                    'HOOKS.SERVER_STARTED'
                ]);

                stopLuna().then(() => {
                    setTimeout(() => {
                        done()
                    }, 1000);
                });
            }

            console.log = (text) => {
                if (typeof text !== "string") {
                    return;
                }

                if (text.indexOf("HOOKS.") === 0) {
                    originalConsoleLog(text);
                    calledHooks.push(text.trim());
                }

                if (text.indexOf("HOOKS.SERVER_STARTED") === 0) {
                    setTimeout(() => {
                        assertHooks();
                    }, 1000);
                }
            };

            startLuna().then(() => {
            })
        });

        it('should call the request hook', function (done) {
            const {startLuna, stopLuna} = require("../../../packages/luna/src/framework");

            console.log = text => {
                if (text === 'HOOKS.REQUEST_RECEIVED') {
                    setTimeout(() => {
                        stopLuna().then(() => done());
                    }, 100);
                }

                originalConsoleLog(text);
            };

            startLuna()
                .then(() => sleep(300))
                .then(() => chai.request('http://localhost:3010').get('/').send());
        });
    });


});
