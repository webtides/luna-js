const { chai, BUILD_SCRIPT } = require('../../helpers');
const { execSync } = require('node:child_process');

// TODO: these tests are actually returning green when run individually... but somehow log 5x the same output... I think it has either to do with the console.log stubbing or how the luna server is started/stopped...
describe.skip('Luna hooks test', function () {
	this.timeout(0); // this is for the execSync call so that it can take longer than 2000ms

	before(() => {
		process.chdir(global.getCurrentWorkingDirectory('basic'));
		// TODO: this actually only needs to be done once for all the tests...
		execSync(`${BUILD_SCRIPT} --build`);
	});

	describe('Hooks Registration', () => {
		let logs = [];
		beforeEach(async function () {
			global.originalConsoleLog = console.log;
			console.log = (text) => {
				logs.push(text);
			};
		});

		afterEach(function () {
			console.log = global.originalConsoleLog;
			logs = [];
		});

		it.skip('should call the startup hooks in the right order', async () => {
			const { startLuna, stopLuna } = require('../../../packages/luna/src/framework');

			await startLuna();
			await stopLuna();

			chai.assert.deepEqual(logs.filter(log => log.startsWith('HOOKS.')), [
				'HOOKS.LUNA_INITIALIZE',
				'HOOKS.HOOKS_LOADED',
				'HOOKS.COMPONENTS_LOADED',
				'HOOKS.MIDDLEWARE_REGISTER',
				'HOOKS.MIDDLEWARE_REGISTER_2',
				'HOOKS.ROUTES_BEFORE_REGISTER',
				'HOOKS.ROUTES_AFTER_REGISTER',
				'HOOKS.SERVER_STARTED',
			]);
		});

		it('should call the request hook', async () => {
			const { startLuna, stopLuna } = require('../../../packages/luna/src/framework');

			await startLuna();
			logs = [];

			await chai.request('http://localhost:3010').get('/').send();
			await stopLuna();

			chai.assert.deepEqual(logs, ['HOOKS.REQUEST_RECEIVED']);
		});
	});
});
