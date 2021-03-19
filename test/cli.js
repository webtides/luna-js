const {execSync} = require("child_process");
const path = require("path");
const fs = require("fs");

const chai = require("chai");
chai.use(require("chai-fs"));

const BUILD_SCRIPT = 'node node_modules/@webtides/luna-cli/.bin/luna.js'
const execute = (cmd) => {
    return execSync(cmd, { stdio: 'inherit' });
};

let previousWorkingDirectory;

before(function() {
    previousWorkingDirectory = process.cwd();
});

describe("Luna cli test", function () {
    this.timeout(0);

    describe("Prepare", function() {
        execSync('cd packages/cli && npm install');
        execSync('cd packages/luna && npm install');

        process.chdir(path.join(process.cwd(), "test/fixtures/basic"));

        execute('npm install --save-dev $(npm pack ../../../packages/cli | tail -1)');
        execute('npm install --save $(npm pack ../../../packages/luna | tail -1)');
    })

    describe("Build test", function () {
        before(function() {
            execSync(`${BUILD_SCRIPT} --build`);
        });

        it("has generated the build directory", async function () {
            chai.expect('.build').to.be.a.directory().with.contents([ 'public', 'generated' ]);
        });

        it("has generated the manifest files", async function () {
            chai.expect('.build/generated').to.be.a.directory().with.files([ 'manifest.json', 'manifest.client.json' ]);
        });

        describe("Manifest test", function() {
            before(function() {
                this.manifest = JSON.parse(fs.readFileSync(".build/generated/manifest.json", "utf-8"));
            })

            it("has generated all components from the manifest", function() {
                const { components } = this.manifest;
                for (const component of components) {
                    chai.expect(path.join('.build/generated/application', component.file)).to.be.a.file().and.not.empty;
                }
            });

            it("has generated all pages from the manifest", function() {
                const { pages } = this.manifest;
                for (const page of pages) {
                    chai.expect(path.join('.build/generated/application', page.file)).to.be.a.file().and.not.empty;
                }
            });

            it("has generated all apis from the manifest", function() {
                const { apis } = this.manifest;
                for (const api of apis) {
                    chai.expect(path.join('.build/generated/application', api.file)).to.be.a.file().and.not.empty;
                }
            });

            it("has generated all hooks from the manifest", function() {
                const { hooks } = this.manifest;
                for (const hook of hooks) {
                    chai.expect(path.join('.build/generated/application', hook.file)).to.be.a.file().and.not.empty;
                }
            });
        });
    });
});

after(function() {
    process.chdir(previousWorkingDirectory);
})
