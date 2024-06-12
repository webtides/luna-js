import { execSync, spawn } from 'node:child_process';
import {
	BUILD_SCRIPT,
	LUNA_CLI_SCRIPT,
	assertIsFile,
	assertIsDirectory,
	assertFileIsNotEmpty,
	assertFileContains,
	httpRequest,
} from '../../helpers/index.js';
import assert from 'node:assert';

export const emptyCliTest = () => {
	describe('Empty cli test', function () {
		this.timeout(0);

		before(function () {
			process.chdir(global.getCurrentWorkingDirectory('empty'));
			execSync(`npm install`);
		});

		describe('Build test', () => {
			before(() => {
				execSync(`${BUILD_SCRIPT} --setup --build`);
			});

			it('has generated the luna.config.js', () => {
				assertIsFile('luna.config.js');
				assertFileIsNotEmpty('luna.config.js');
			});

			it('has generated the index page', () => {
				assertIsFile('views/pages/index.js');
				assertFileIsNotEmpty('views/pages/index.js');
			});

			it('has generated the example component', () => {
				assertIsFile('views/components/example-component.js');
				assertFileIsNotEmpty('views/components/example-component.js');
			});
		});

		describe('Static export test', () => {
			before(() => {
				execSync(`${BUILD_SCRIPT} --export`);
			});

			it('has generated the export directory', () => {
				assertIsDirectory('.export');
			});

			it('has generated the index.html', () => {
				assertIsFile('.export/public/index.html');
				assertFileContains('.export/public/index.html', 'Welcome to luna-js');
			});
		});

		describe('Run test', () => {
			it('starts luna on port 3005', (done) => {
				const child = spawn(`node`, [LUNA_CLI_SCRIPT, '--start'], { detached: true });
				child.stdout.on('data', (data) => {
					if (data.toString().indexOf('luna-js listening at') !== -1) {
						httpRequest('http://localhost:3005/').then(({ error, response }) => {
							assert.equal(error, null);
							assert.equal(response.status, 200);
							process.kill(-child.pid);
							done();
						});
					}
				});
			});
		});
	});
};
