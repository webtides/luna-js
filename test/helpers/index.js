import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import nodePath from 'node:path';
import assert from 'node:assert';

const BUILD_SCRIPT = 'node node_modules/@webtides/luna-cli/bin/luna.js';
const LUNA_CLI_SCRIPT = 'node_modules/@webtides/luna-cli/bin/luna.js';

const LUNA_START_SCRIPT = 'node_modules/@webtides/luna-js/start';

global.previousWorkingDirectory = global.previousWorkingDirectory || process.cwd();
global.getCurrentWorkingDirectory = (fixture) => {
	return global.previousWorkingDirectory + '/test/fixtures/' + fixture;
};

const execute = (cmd) => {
	return execSync(cmd, { stdio: 'inherit' });
};

const sleep = (timeout) => {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), timeout);
	});
};

const startLuna = ({ onStart, onMessage } = {}) => {
	const child = spawn(`node`, [LUNA_START_SCRIPT]);

	child.stdout.on('data', (data) => {
		if (data.indexOf('luna-js listening at') !== -1) {
			onStart && onStart();
		}

		onMessage && onMessage();
	});

	return () => {
		child.stdin.pause();
		child.kill();
	};
};

const assertDirectoryContains = (path, contains, message) => {
	const contents = Array.isArray(contains) ? contains : [contains];
	assert.ok(
		contents.every((content) => fs.existsSync(nodePath.join(path, content))),
		message || `directory should include ${contains}`,
	);
};

const assertFileContains = (path, contains, message) => {
	const contents = fs.readFileSync(path, 'utf-8');
	assert.ok(contents.includes(contains), message || `file should include ${contains}`);
};

const assertFileNotContains = (path, contains, message) => {
	const contents = fs.readFileSync(path, 'utf-8');
	assert.ok(!contents.includes(contains), message || `file should not include ${contains}`);
};

const assertContains = (value, contains, message) => {
	assert.ok(value.includes(contains), message || `value should include ${contains}`);
};

const assertNotContains = (value, contains, message) => {
	assert.ok(!value.includes(contains), message || `value should not include ${contains}`);
};

const assertIsDirectory = (path, message) => {
	assert.ok(fs.lstatSync(path).isDirectory(), message || `path should be a directory`);
};

const assertIsFile = (path, message) => {
	assert.ok(fs.lstatSync(path).isFile(), message || `path should be a file`);
};

const assertFileIsEmpty = (path, message) => {
	assert.ok(fs.existsSync(path) && fs.statSync(path).size === 0, message || `path should be a empty`);
};

const assertFileIsNotEmpty = (path, message) => {
	assert.ok(fs.existsSync(path) && fs.statSync(path).size !== 0, message || `path should not be a empty`);
};

/**
 * @param {RequestInfo} input
 * @param {RequestInit} init
 * @return {Promise<unknown>}
 */
const httpRequest = async (input, init = {}) => {
	let error = null;
	let response = undefined;

	return new Promise((resolve) => {
		fetch(input, init)
			.then((fetchResponse) => {
				response = fetchResponse;
				// TODO: handle blob etc. as well....
				if (response?.headers.get('content-type').includes('application/json')) {
					return response.json();
				} else {
					return response.text();
				}
			})
			.then((body) => {
				if (response?.headers.get('content-type').includes('application/json')) {
					response.json = body;
				} else {
					response.text = body;
				}
				// response.body = body;
			})
			.catch((fetchError) => {
				error = fetchError;
			})
			.finally(() => {
				resolve({ error, response });
			});
	});
};

// TODO: add helper to make route requests against the express app router
// https://stackoverflow.com/questions/33090091/is-it-possible-to-call-express-router-directly-from-code-with-a-fake-request

export {
	BUILD_SCRIPT,
	LUNA_CLI_SCRIPT,
	LUNA_START_SCRIPT,
	startLuna,
	execute,
	sleep,
	assertDirectoryContains,
	assertFileContains,
	assertFileNotContains,
	assertContains,
	assertNotContains,
	assertIsDirectory,
	assertIsFile,
	assertFileIsEmpty,
	assertFileIsNotEmpty,
	httpRequest,
};
