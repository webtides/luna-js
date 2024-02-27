import { basic } from './shared/api.js';

export const basicApiTest = () => {
	describe('Luna api test', function () {
		before(async function () {
			process.chdir(global.getCurrentWorkingDirectory('basic'));
			const { startLuna } = await import('../../../packages/luna/src/framework/index.js');
			global.originalConsoleLog = console.log;
			await startLuna();
		});

		after(async function () {
			console.log = global.originalConsoleLog;
			const { stopLuna } = await import('../../../packages/luna/src/framework/index.js');
			await stopLuna();
		});

		describe('Basic api tests', function () {
			basic();
		});
	});
};
