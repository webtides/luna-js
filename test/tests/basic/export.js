const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const { chai, sleep } = require('../../helpers');

describe('Basic export test', function () {
	this.timeout(20000);

	let child = null;

	before(function (done) {
		process.chdir(global.getCurrentWorkingDirectory('basic'));

		child = spawn(`node`, ['./.api/test-export.js']);

		child.stdout.on('data', (data) => {
			if (data.toString().indexOf('HOOKS.SERVER_STARTED') !== -1) {
				setTimeout(async () => {
					await sleep(1000);
					done();
				}, 100);
			}
		});
	});

	after(function () {
		child.stdin.pause();
		child.kill();
	});

	it('should exclude the cors dependency', function () {
		const packageJSON = JSON.parse(fs.readFileSync('./.api/package.json', 'utf-8'));
		chai.expect(packageJSON.dependencies['cors']).to.be.undefined;
	});

	describe('Exported api', function () {
		require('./shared/api').basic();
	});
});
