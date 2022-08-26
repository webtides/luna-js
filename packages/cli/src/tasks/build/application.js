import path from 'path';
import rimraf from 'rimraf';
import chokidar from 'chokidar';

import { startRollup, startRollupWatch } from '../build.js';
import { getConfig } from '../../config.js';

const buildEntryPoint = async () => {
	console.log('Building entry point...');

	await startRollup(path.join(getConfig().currentDirectory, 'build/configs/rollup.config.start.js'));

	console.log('Done building entry point.');
};

/**
 * Builds the whole application once.
 *
 * - Deletes the old output folder
 * - Builds the luna entrypoint
 * - Builds the application
 *
 * @returns {Promise<void>}
 */
const buildComponentsForApplication = async () => {
	const { settings } = getConfig();

	// Clean the build directory before starting a new build.
	rimraf.sync(settings.build.output);

	await buildEntryPoint();

	console.log('Building application..');

	await startRollup(path.join(getConfig().currentDirectory, 'build/configs/rollup.config.application.js'));

	console.log('Done building application.');
};

const startApplicationDevelopmentBuild = async (callback = () => {}) => {
	const { settings } = getConfig();

	// Clean the build directory before starting a new build.
	rimraf.sync(settings.build.output);

	await buildEntryPoint();

	console.log('Start application development build...');

	let watcher;

	const initializeServerWatcher = async (restart = true) => {
		if (!restart) {
			return;
		}

		watcher = await startRollupWatch(
			path.join(getConfig().currentDirectory, 'build/configs', 'rollup.config.application.js'),
			() => {
				callback();
			},
			() => {
				watcher && watcher.close();
			},
		);

		watcher.on('close', () => {
			initializeServerWatcher(true);
		});
	};

	chokidar
		.watch(
			[
				...settings.components.bundles.map((bundle) => bundle.input),
				...settings.pages.input,
				...settings.api.input,
				...settings.hooks.input,
			],
			{ ignoreInitial: true },
		)
		.on('add', async (event, filePath) => {
			console.log('File added. Restart watcher');
			watcher && watcher.close();
		});

	await initializeServerWatcher(true);
};

export { buildEntryPoint, buildComponentsForApplication, startApplicationDevelopmentBuild };
