import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';

import { execute, BUILD_SCRIPT, LUNA_CLI_SCRIPT, chai, sleep } from '../../helpers/index.js';

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
				chai.expect('luna.config.js').to.be.a.file().and.not.empty;
			});

			it('has generated the index page', () => {
				chai.expect('views/pages/index.js').to.be.a.file().and.not.empty;
			});

			it('has generated the example component', () => {
				chai.expect('views/components/example-component.js').to.be.a.file().and.not.empty;
			});
		});

		describe('Static export test', () => {
			before(() => {
				execSync(`${BUILD_SCRIPT} --export`);
			});

			it('has generated the export directory', () => {
				chai.expect('.export').to.be.a.directory();
			});

			it('has generated the index.html', () => {
				chai.expect('.export/public/index.html').to.be.a.file();
				const contents = fs.readFileSync('.export/public/index.html', 'utf-8');
				chai.expect(contents).to.include('Welcome to luna-js');
			});
		});

		describe('Run test', () => {
			it('starts luna on port 3005', (done) => {
				const child = spawn(`node`, [LUNA_CLI_SCRIPT, '--start'], { detached: true });
				child.stdout.on('data', (data) => {
					if (data.toString().indexOf('luna-js listening at') !== -1) {
						chai.request('http://localhost:3005')
							.get('/')
							.end((error, response) => {
								chai.assert.equal(error, null);
								chai.assert.equal(response.status, 200);
								process.kill(-child.pid);
								done();
							});
					}
				});
			});
		});
	});
};
