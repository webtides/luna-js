import * as rollup from 'rollup';
import loadConfigFile from 'rollup/dist/loadConfigFile';

const startRollupWatch = async (configFile, callback = () => {}, fileRemovedCallback = () => {}) => {
	try {
		const { options, warnings } = await loadConfigFile(configFile);
		warnings.flush();

		const watcher = rollup.watch(options);
		watcher.on('event', ({ code, result, error }) => {
			switch (code) {
				case 'BUNDLE_END':
					result.close();
					return;
				case 'START':
					break;
				case 'END':
					callback();
					break;
				case 'ERROR':
					if (error?.code === 'UNRESOLVED_ENTRY') {
						// An entry file has been removed.
						fileRemovedCallback();
						return;
					}

					if (error.reason) {
						console.error(error.reason);
					} else {
						console.error(error);
					}
					break;
			}
		});

		return watcher;
	} catch (error) {
		console.error(error);
	}

	return null;
};

const startRollup = async (configFile) => {
	const { options, warnings } = await loadConfigFile(configFile);
	warnings.flush();

	for (const option of options) {
		const bundle = await rollup.rollup(option);

		for (const outputOptions of option.output) {
			await bundle.write(option.output[0]);
		}

		await bundle.close();
	}
};

export { startRollup, startRollupWatch };
