const {execSync} = require("child_process");

const { execute, BUILD_SCRIPT, chai } = require("../../helpers");

describe("Legacy cli test", function () {
    this.timeout(0);

    before(function() {
        process.chdir(global.getCurrentWorkingDirectory('legacy'));
    });

    describe("Fixture preparation", function() {
        it("should prepare the fixtures", function() {
            execSync('cd ../../../packages/cli && yarn install --prod --frozen-lockfile');
            execSync('cd ../../../packages/luna && yarn install --frozen-lockfile');

            execute('yarn add --dev $(npm pack ../../../packages/cli | tail -1)');
            execute('yarn add $(npm pack ../../../packages/luna | tail -1)');
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
