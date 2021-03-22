const {execSync} = require("child_process");

const { execute, BUILD_SCRIPT, chai } = require("../../helpers");

describe("Legacy cli test", function () {
    this.timeout(0);

    before(function() {
        process.chdir(global.currentWorkingDirectory);
    });

    describe("Fixture preparation", function() {
        it("should prepare the fixtures", function() {
            console.log("CURRENTW ORKINASDFIOASDNF POIASEJDF OASDJF ", process.cwd());
            execSync('cd ../../../packages/cli && npm install');
            execSync('cd ../../../packages/luna && npm install');

            execute('npm install --save-dev $(npm pack ../../../packages/cli | tail -1)');
            execute('npm install --save $(npm pack ../../../packages/luna | tail -1)');
        })
    })

    describe("Build test", function () {
        before(function() {
            execSync(`${BUILD_SCRIPT} --build`);
        });

        it("has generated the legacy bundle", async function () {
            chai.expect('.build/public/bundle.legacy.js').to.be.a.file().and.not.empty;
        });

        it("has copied the webcomponents-bundle polyfill", async function() {
            chai.expect('.build/public/libraries/webcomponents-bundle.js').to.be.a.file().and.not.empty;
        })
    });
});
