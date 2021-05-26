const {execSync, spawn} = require("child_process");
const path = require("path");
const fs = require("fs");

const {sleep, execute, BUILD_SCRIPT, LUNA_CLI_SCRIPT, chai} = require("../../helpers");

describe("Basic cli test", function () {
    this.timeout(0);

    before(function () {
        process.chdir(global.getCurrentWorkingDirectory('basic'));
    });

    describe("Fixture preparation", function () {
        it("should prepare the fixtures", function () {
            execSync('cd ../../../packages/cli && npm install');
            execSync('cd ../../../packages/luna && npm install');

            execute('npm install --save-dev $(npm pack ../../../packages/cli | tail -1)');
            execute('npm install --save $(npm pack ../../../packages/luna | tail -1)');
        })
    })

    describe("Build test", function () {
        before(function () {
            execSync(`${BUILD_SCRIPT} --build`);
        });

        it("has generated the build directory", async function () {
            chai.expect('.build').to.be.a.directory().with.contents(['public', 'generated']);
        });

        it("has generated the manifest files", async function () {
            chai.expect('.build/generated').to.be.a.directory();
        });

        it("has copied the static assets", async function() {
            chai.expect(".build/public/assets/static").to.be.a.directory();
            chai.expect(".build/public/assets/static/test.txt").to.be.a.file().and.not.empty;
        });

        describe("Manifest test", function () {
            before(function () {
                this.manifest = JSON.parse(fs.readFileSync(".build/generated/manifest.json", "utf-8"));
            })

            it("has generated all components from the manifest", function () {
                const {components} = this.manifest;
                for (const component of components) {
                    chai.expect(path.join('.build/generated/application', component.file)).to.be.a.file().and.not.empty;
                }
            });

            it("has generated all pages from the manifest", function () {
                const {pages} = this.manifest;
                for (const page of pages) {
                    chai.expect(path.join('.build/generated/application', page.file)).to.be.a.file().and.not.empty;
                }
            });

            it("has generated all apis from the manifest", function () {
                const {apis} = this.manifest;
                for (const api of apis) {
                    chai.expect(path.join('.build/generated/application', api.file)).to.be.a.file().and.not.empty;
                }
            });

            it("has generated all hooks from the manifest", function () {
                const {hooks} = this.manifest;
                for (const hook of hooks) {
                    chai.expect(path.join('.build/generated/application', hook.file)).to.be.a.file().and.not.empty;
                }
            });
        });
    });

    describe("Api export test", function () {
        before(function () {
            execSync(`${BUILD_SCRIPT} --export=hybrid`);
        });

        it("has generated the api entry", async function () {
            chai.expect(".api").to.be.a.directory();
            chai.expect(".api/test-export.js").to.be.a.file();
        });

        it ("has generated the index.html", function() {
            chai.expect(".api/public/index.html").to.be.a.file();
            const contents = fs.readFileSync('.api/public/index.html', 'utf-8');
            chai.expect(contents).to.include('HELLO MOCHA');
        });

        it ("starts the exported api server", function(done) {
            const child = spawn(`node`, [ ".api/test-export.js" ]);

            child.stdout.on('data', (data) => {
                console.log(data.toString());
                if (data.toString().indexOf('HOOKS.SERVER_STARTED') !== -1) {
                    setTimeout(async () => {
                        await chai.request('http://localhost:3010').get('/').send();

                        child.stdin.pause();
                        child.kill();

                        await sleep(1000);

                        done();
                    }, 100);
                }
            });
        });
    });

    describe("Static export test", function () {
        before(function () {
            execSync(`${BUILD_SCRIPT} --export`);
        });

        it("has generated the export directory", async function () {
            chai.expect(".export").to.be.a.directory();
        });

        it ("has generated the index.html", function() {
            chai.expect(".export/public/index.html").to.be.a.file();
            const contents = fs.readFileSync('.export/public/index.html', 'utf-8');
            chai.expect(contents).to.include('HELLO MOCHA');
        });

        it ("has generated the fallback/index.html", function() {
            chai.expect(".export/public/fallback/index.html").to.be.a.file();
            const contents = fs.readFileSync('.export/public/fallback/index.html', 'utf-8');
            chai.expect(contents).to.include('MOCHA FALLBACK PAGE');
        });

        it ("has generated the dynamic page", function() {
            chai.expect(".export/public/params/export/index.html").to.be.a.file();
            const contents = fs.readFileSync('.export/public/params/export/index.html', 'utf-8');
            chai.expect(contents).to.include('ID: export');
        });
    });

    describe("Run test", function () {
        it("starts luna on port 3010", function (done) {
            const child = spawn(`node`, [LUNA_CLI_SCRIPT, '--start']);

            let isDone = false;

            child.stdout.on('data', (data) => {
                if (data.toString().indexOf('HOOKS.SERVER_STARTED') !== -1) {
                    if (isDone) {
                        return;
                    }
                    isDone = true;

                    setTimeout(async () => {
                        await chai.request('http://localhost:3010').get('/').send();

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
