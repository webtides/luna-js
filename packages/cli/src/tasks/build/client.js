import path from 'path';
import { startRollup, startRollupWatch } from '../build.js';
import { getConfig } from '../../config.js';

const startClientDevelopmentBuild = () => {
	startRollupWatch(path.join(getConfig().currentDirectory, 'build/configs', 'rollup.config.client.js'));
};

const buildComponentsForClient = async () => {
	await startRollup(path.join(getConfig().currentDirectory, 'build/configs', 'rollup.config.client.js'));
};

export { startClientDevelopmentBuild, buildComponentsForClient };
