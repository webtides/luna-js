import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkRequirements, loadConfig } from './tasks/prepare.js';
import { buildComponentsForApplication, startApplicationDevelopmentBuild } from './tasks/build/application.js';
import exportStaticSite from './tasks/export/index.js';
import { generateAPI } from './tasks/export/api-generator.js';
import { getConfig, setConfig } from './config.js';
import { startLunaJS, stopLunaJS } from './run.js';

// This should actually be not needed, but in a test
// environment the child process lingers around and obstructs
// following tests.
// Here we just manually kill the child process if the
// current process exits.
process.on('exit', () => {
	stopLunaJS();
});

const execute = async (argv) => {
	setConfig({
		currentWorkingDirectory: process.cwd(),
		currentDirectory: path.dirname(path.dirname(fileURLToPath(import.meta.url))),
		isExporting: !!argv.export,
		documentInject: '',
	});

	const meetsRequirements = await checkRequirements({ setup: argv.setup });

	if (!meetsRequirements) {
		return;
	}

	const lunaConfig = await loadConfig();
	setConfig({
		...getConfig(),
		settings: lunaConfig,
	});

	// Not the recommended way to start luna like this, as there
	// is a big overhead for using @babel/register and other
	// helper functions for the cli.
	if (argv.start) {
		await startLunaJS();
		return;
	}

	if (argv.dev) {
		console.log('Starting luna in development mode.');

		await startApplicationDevelopmentBuild(async () => {
			await startLunaJS();
		});

		return;
	}

	if (argv.build) {
		await buildComponentsForApplication();
		return;
	}

	if (argv.export) {
		switch (argv.export) {
			case 'api':
			case 'hybrid':
				await generateAPI({
					serverless: argv.serverless,
					withStaticSite: argv.export === 'hybrid',
				});
				break;
			default:
				await exportStaticSite();
				break;
		}

		return;
	}

	// Default
	await buildComponentsForApplication();
	startLunaJS();
};

export { execute };
