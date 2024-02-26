const { chai, sleep } = require('../../helpers');
const { basic } = require('./shared/api');

describe('Luna api test', function () {
	before(async function () {
		process.chdir(global.getCurrentWorkingDirectory('basic'));
		const { startLuna } = require('../../../packages/luna/src/framework');

		global.originalConsoleLog = console.log;
		await startLuna();
	});

	after(async function () {
		console.log = global.originalConsoleLog;
		const { stopLuna } = require('../../../packages/luna/src/framework');
		await stopLuna();
	});

	describe('Basic api tests', function () {
		console.log = () => {};
		basic();
	});
});
