const { execSync, spawn } = require('child_process');
const fs = require('fs');

const { execute, BUILD_SCRIPT, LUNA_CLI_SCRIPT, chai, sleep } = require('../../helpers');

describe('Empty cli test', function () {
	this.timeout(0);

	before(function () {
		process.chdir(global.getCurrentWorkingDirectory('empty'));
	});

	describe('Fixture preparation', function () {
		it('should prepare the fixtures', function () {
			execSync('cd ../../../packages/cli && npm install');
			execSync('cd ../../../packages/luna && npm install');
		});
	});

	describe('Build test', function () {
		before(function () {
			execSync(`${BUILD_SCRIPT} --setup --build`);
		});

		it('has generated the luna.config.js', async function () {
			chai.expect('luna.config.js').to.be.a.file().and.not.empty;
		});

		it('has generated the index page', async function () {
			chai.expect('views/pages/index.js').to.be.a.file().and.not.empty;
		});

		it('has generated the example component', async function () {
			chai.expect('views/components/example-component.js').to.be.a.file().and.not.empty;
		});
	});

	describe('Static export test', function () {
		before(function () {
			execSync(`${BUILD_SCRIPT} --export`);
		});

		it('has generated the export directory', async function () {
			chai.expect('.export').to.be.a.directory();
		});

		it('has generated the index.html', function () {
			chai.expect('.export/public/index.html').to.be.a.file();
			const contents = fs.readFileSync('.export/public/index.html', 'utf-8');
			chai.expect(contents).to.include('Welcome to luna-js');
		});
	});

	describe('Run test', function () {
		it('starts luna on port 3005', function (done) {
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
