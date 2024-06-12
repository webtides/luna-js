import { execSync } from 'node:child_process';
import { BUILD_SCRIPT, httpRequest } from '../../helpers/index.js';
import assert from 'node:assert';

export const basicHooksTest = () => {
	// TODO: these tests are actually returning green when run individually... but somehow log 5x the same output... I think it has either to do with the console.log stubbing or how the luna server is started/stopped...
	describe.skip('Luna hooks test', function () {
		this.timeout(0);

		before(async function () {
			process.chdir(global.getCurrentWorkingDirectory('basic'));
			// TODO: this actually only needs to be done once for all the tests...
			execSync(`${BUILD_SCRIPT} --build`);
		});

		describe('Hooks Registration', function () {
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

			it('should call the startup hooks in the right order', async () => {
				const { startLuna, stopLuna } = await import('../../../packages/luna/src/framework/index.js');

				await startLuna();
				await stopLuna();

				assert.deepEqual(
					logs.filter((log) => log.startsWith('HOOKS.')),
					[
						'HOOKS.LUNA_INITIALIZE',
						'HOOKS.HOOKS_LOADED',
						'HOOKS.COMPONENTS_LOADED',
						'HOOKS.MIDDLEWARE_REGISTER',
						'HOOKS.MIDDLEWARE_REGISTER_2',
						'HOOKS.ROUTES_BEFORE_REGISTER',
						'HOOKS.ROUTES_AFTER_REGISTER',
						'HOOKS.SERVER_STARTED',
					],
				);
			});

			it('should call the request hook', async () => {
				const { startLuna, stopLuna } = await import('../../../packages/luna/src/framework/index.js');

				await startLuna();
				logs = [];

				await httpRequest('http://localhost:3010');
				await stopLuna();

				assert.deepEqual(logs, ['HOOKS.REQUEST_RECEIVED']);
			});
		});
	});
};
