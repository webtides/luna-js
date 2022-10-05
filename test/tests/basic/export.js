import { spawn } from "node:child_process";
import fs from 'node:fs';
import { chai } from '../../helpers/index.js';

export const basicExportTest = () => {
	describe('Basic export test', () => {
		let child = null;

		before((done) => {
			process.chdir(global.getCurrentWorkingDirectory('basic'));
			child = spawn(`node`, ['.api/test-export.js'], { detached: true });
			child.stdout.on('data', (data) => {
				if (data.toString().indexOf('HOOKS.SERVER_STARTED') !== -1) {
					done();
				}
			});
		});

		after(() => {
			process.kill(-child.pid);
		});

		it('should exclude the cors dependency', () => {
			const packageJSON = JSON.parse(fs.readFileSync('./.api/package.json', 'utf-8'));
			chai.expect(packageJSON.dependencies['cors']).to.be.undefined;
		});

		describe('Exported api', async () => {
			const { basic } = await import('./shared/api.js');
			basic();
		});
	});
};
