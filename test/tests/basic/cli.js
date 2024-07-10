import { execSync, spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

import {
	assertDirectoryContains,
	assertFileContains,
	assertFileIsNotEmpty,
	assertIsDirectory,
	assertIsFile,
	BUILD_SCRIPT,
	httpRequest,
} from '../../helpers/index.js';
import assert from 'node:assert';

export const basicCliTest = () => {
	describe('Basic cli test', function () {
		this.timeout(0);

		before(function () {
			process.chdir(global.getCurrentWorkingDirectory('basic'));
			execSync(`npm install`);
		});

		describe('Build test', function () {
			before(function () {
				execSync(`${BUILD_SCRIPT} --build`);
			});

			it('has generated the build directory', async function () {
				assertDirectoryContains('.build', ['public', 'generated']);
			});

			it('has generated the manifest files', async function () {
				assertIsDirectory('.build/generated');
			});

			it('has copied the static assets', async function () {
				assertIsDirectory('.build/public/assets/static');
				assertFileIsNotEmpty('.build/public/assets/static/test.txt');
			});

			describe('Manifest test', function () {
				before(function () {
					this.manifest = JSON.parse(fs.readFileSync('.build/generated/manifest.json', 'utf-8'));
				});

				it('has generated all components from the manifest', function () {
					const { components } = this.manifest;
					for (const component of components) {
						assertFileIsNotEmpty(path.join('.build/generated/application', component.file));
					}
				});

				it('has generated all pages from the manifest', function () {
					const { pages } = this.manifest;
					for (const page of pages) {
						assertFileIsNotEmpty(path.join('.build/generated/application', page.file));
					}
				});

				it('has generated all apis from the manifest', function () {
					const { apis } = this.manifest;
					for (const api of apis) {
						assertFileIsNotEmpty(path.join('.build/generated/application', api.file));
					}
				});

				it('has generated all hooks from the manifest', function () {
					const { hooks } = this.manifest;
					for (const hook of hooks) {
						assertFileIsNotEmpty(path.join('.build/generated/application', hook.file));
					}
				});
			});
		});

		describe('Api export test', function () {
			before(function () {
				execSync(`${BUILD_SCRIPT} --export=hybrid`);
			});

			it('has generated the api entry', async function () {
				assertIsDirectory('.api');
				assertIsFile('.api/test-export.js');
			});

			it('has generated the index.html', function () {
				assertIsFile('.api/public/index.html');
				assertFileContains('.api/public/index.html', 'HELLO MOCHA');
			});

			it('starts the exported api server', function (done) {
				const child = spawn(`node`, ['.api/test-export.js'], { detached: true });
				child.stdout.on('data', (data) => {
					if (data.toString().indexOf('HOOKS.SERVER_STARTED') !== -1) {
						httpRequest('http://localhost:3010/').then(({ error, response }) => {
							assert.equal(error, null);
							assert.equal(response.status, 200);
							process.kill(-child.pid);
							done();
						});
					}
				});
			});
		});

		describe('Static export test', function () {
			before(function () {
				execSync(`${BUILD_SCRIPT} --export`);
			});

			it('has generated the export directory', async function () {
				assertIsDirectory('.export');
			});

			it('has generated the index.html', function () {
				assertIsFile('.export/public/index.html');
				assertFileContains('.export/public/index.html', 'HELLO MOCHA');
			});

			it('has generated the fallback/index.html', function () {
				assertIsFile('.export/public/fallback/index.html');
				assertFileContains('.export/public/fallback/index.html', 'MOCHA FALLBACK PAGE');
			});

			it('has generated the dynamic page', function () {
				assertIsFile('.export/public/params/export/index.html');
				assertFileContains('.export/public/params/export/index.html', 'ID: export');
			});
		});

		// TODO: as soon as we can pass a custom config to luna, implement it again with a different port
		// There seems to be a bug in github actions, which i cannot reproduce locally,
		// where the child_process of the cli (luna) won't get killed and the server
		// lingers around which blocks the port for all following tests.

		// describe("Run test", function () {
		//     it("starts luna on port 3010", function (done) {
		//         const child = spawn(`node`, [LUNA_CLI_SCRIPT, '--start']);
		//
		//         child.stdout.on('data', (data) => {
		//             if (data.toString().indexOf('HOOKS.SERVER_STARTED') !== -1) {
		//                 setTimeout(async () => {
		//                     await chai.request('http://localhost:3010').get('/').send();
		//
		//                     // Wait for the child to be closed.
		//                     child.on('close', () => {
		//                         console.log("Run test: child process stopped.")
		//                         done();
		//                     });
		//
		//                     child.kill();
		//                 }, 100);
		//             }
		//         });
		//     });
		// });
	});
};
