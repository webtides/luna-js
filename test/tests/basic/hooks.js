const {chai, sleep} = require("../../helpers");

describe("Luna hooks test", function () {
    this.timeout(10000);

    let lunaServer = false;

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

            const {startLuna} = require("../../../packages/luna/lib/framework");

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

                global.lunaServer
                    .stop()
                    .then(() => {
                        done()
                    });
            }

            console.log = (text) => {
                if (typeof text !== "string") {
                    return;
                }

                if (text.indexOf("HOOKS.") === 0) {
                    calledHooks.push(text.trim());
                }

                if (text.indexOf("HOOKS.SERVER_STARTED") === 0) {
                    setTimeout(() => {
                        assertHooks();
                    }, 1000);
                }

                originalConsoleLog(text);
            };

            startLuna()
                .then(() => {
                    console.log("LUNA SERVER");
                    console.log(luna.get('LunaServer'));
                    global.lunaServer = luna.get('LunaServer');
                })
        });

        it('should call the request hook', function (done) {

            console.log = text => {
                if (text === 'HOOKS.REQUEST_RECEIVED') {
                    global.lunaServer.stop()
                        .then(() => done());
                }

                originalConsoleLog(text);
            };

            global.lunaServer
                .start()
                .then(() => sleep(300))
                .then(() =>  chai.request('http://localhost:3010').get('/').send());
        });
    });


});
