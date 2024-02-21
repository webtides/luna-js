import { spawn } from 'child_process';
import path from 'path';

import { getConfig } from './config';

let currentLunaProcess = null;
let waitForProcessToBeKilled = null;

const startLunaJS = async () => {
	if (currentLunaProcess !== null) {
		waitForProcessToBeKilled.then(() => startLunaJS());

		currentLunaProcess.kill();
		currentLunaProcess = null;
		return;
	}

	const { settings } = getConfig();
	const { baseDirectory } = settings._generated;

	const generatedStartScript = path.join(getConfig().currentWorkingDirectory, baseDirectory, 'start.js');

	const child = spawn('node', [generatedStartScript]);

	child.stdout.pipe(process.stdout);
	child.stderr.pipe(process.stderr);

	waitForProcessToBeKilled = new Promise((resolve) => {
		child.on('close', () => {
			resolve();
		});
	});

	currentLunaProcess = child;

	return new Promise((resolve) => {
		let _resolved = false;

		child.stdout.on('data', (data) => {
			if (!_resolved && new String(data).indexOf('luna-js listening at port') === 0) {
				_resolved = true;
				resolve();
			}
		});
	});
};

const stopLunaJS = () => {
	if (currentLunaProcess !== null) {
		currentLunaProcess.kill();
		currentLunaProcess = null;
	}
};

export { startLunaJS, stopLunaJS };
