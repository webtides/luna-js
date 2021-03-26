const {execSync, spawn} = require("child_process");

const { execute, BUILD_SCRIPT, LUNA_CLI_SCRIPT, chai, sleep } = require("../../helpers");

describe("Empty cli test", function () {
    this.timeout(0);

    before(function() {
        process.chdir(global.getCurrentWorkingDirectory('empty'));
    });

    describe("Fixture preparation", function() {
        it("should prepare the fixtures", function() {
            execSync('cd ../../../packages/cli && npm install');
            execSync('cd ../../../packages/luna && npm install');

            execute('npm install --save-dev $(npm pack ../../../packages/cli | tail -1)');
            execute('npm install --save $(npm pack ../../../packages/luna | tail -1)');
        })
    })

    describe("Build test", function () {
        before(function() {
            execSync(`${BUILD_SCRIPT} --setup --build`);
        });

        it("has generated the luna.config.js", async function () {
            chai.expect('luna.config.js').to.be.a.file().and.not.empty;
        });
    });

    describe("Run test", function () {
        it("starts luna on port 3005", function (done) {
            const child = spawn(`node`, [LUNA_CLI_SCRIPT, '--start']);

            child.stdout.on('data', (data) => {
                if (data.toString().indexOf('luna-js listening at') !== -1) {
                    setTimeout(async () => {
                        await chai.request('http://localhost:3005').get('/').send();

                        child.stdin.pause();
                        child.kill();

                        await sleep(1000);

                        done();
                    }, 100);
                }
            });
        });
    });
});
