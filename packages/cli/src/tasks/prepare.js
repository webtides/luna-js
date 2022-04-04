import fs from 'fs';
import path from 'path';

import deepmerge from 'deepmerge';
import inquirer from 'inquirer';

import { getConfig, setConfig } from '../config';
import defaultSettings from './prepare/luna.config.base';

const getPathToConfigFile = (currentWorkingDirectory = process.cwd()) => {
	return path.join(currentWorkingDirectory, 'luna.config.js');
};

const loadConfig = async ({ config } = {}) => {
	if (typeof config === 'object') {
		// We have passed a config object to luna. Use that instead of loading the luna.config.js
		config = deepmerge(defaultSettings, config);
	} else {
		const pathToConfigFile = getPathToConfigFile();
		const importedConfigFile = await import(pathToConfigFile);

		config = deepmerge(
			defaultSettings,
			typeof importedConfigFile.__esModule ? importedConfigFile.default : importedConfigFile,
		);
	}

	return {
		...config,
		...loadGeneratedSettingsFromConfig(config),
	};
};

const loadGeneratedSettingsFromConfig = (config) => {
	const publicDirectory = path.join(config.build.output, 'public');

	const _generated = {
		baseDirectory: path.join(config.build.output, 'generated'),
		applicationDirectory: path.join(config.build.output, 'generated', 'application'),

		manifest: path.join(config.build.output, 'generated', 'manifest.json'),
		clientManifest: path.join(config.build.output, 'generated', 'manifest.client.json'),
	};

	return {
		publicDirectory,
		_generated,
	};
};

const copyEmptyLunaConfig = async () => {
	fs.copyFileSync(
		path.join(getConfig().currentDirectory, 'src/tasks/prepare', 'luna.config.example.js'),
		getPathToConfigFile(getConfig().currentWorkingDirectory),
	);

	const settings = await loadConfig();

	settings.pages?.input?.forEach((page) => fs.mkdirSync(page, { recursive: true }));
	settings.hooks?.input?.forEach((hook) => fs.mkdirSync(hook));
	settings.api?.input?.forEach((api) => fs.mkdirSync(api));
	settings.components?.bundles.forEach((component) => {
		fs.mkdirSync(component.input, { recursive: true });
	});

	fs.mkdirSync(path.join(getConfig().currentWorkingDirectory, 'views/layouts'), { recursive: true });
	fs.mkdirSync(path.join(getConfig().currentWorkingDirectory, 'assets/css'), { recursive: true });

	const filesToCopy = [
		{ from: 'src/tasks/prepare/page.example.js', to: path.join(settings.pages.input[0], 'index.js') },
		{
			from: 'src/tasks/prepare/component.example.js',
			to: path.join(settings.components.bundles[0].input, 'example-component.js'),
		},
		{
			from: 'src/tasks/prepare/layout.example.js',
			to: path.join(getConfig().currentWorkingDirectory, 'views/layouts', 'default.js'),
		},
		{
			from: 'src/tasks/prepare/assets/main.example.css',
			to: path.join(getConfig().currentWorkingDirectory, 'assets/css', 'main.css'),
		},
	];

	filesToCopy.forEach(({ from, to }) => {
		fs.copyFileSync(path.join(getConfig().currentDirectory, from), to);
	});
};

const checkRequirements = async ({ setup } = { setup: false }) => {
	const pathToConfigFile = path.join(getConfig().currentWorkingDirectory, 'luna.config.js');

	if (!fs.existsSync(pathToConfigFile)) {
		console.log("We couldn't detect a luna.config.js in your application directory.");
		let result;

		if (!setup) {
			const questions = [
				{
					type: 'confirm',
					default: false,
					name: 'createConfig',
					describe: 'Would you like to create a config file?',
				},
			];

			result = await inquirer.prompt(questions);
		}

		if (setup || result?.createConfig) {
			await copyEmptyLunaConfig();
			return true;
		}

		return false;
	}

	return true;
};

export { checkRequirements, loadConfig, loadGeneratedSettingsFromConfig };
