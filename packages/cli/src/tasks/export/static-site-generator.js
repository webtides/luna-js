import fs from 'fs';
import path from 'path';
import glob from 'glob';

import fetch from 'node-fetch';
import rimraf from 'rimraf';

import { startLunaJS, stopLunaJS } from '../../run.js';
import { getConfig } from '../../config.js';

const getStaticSiteEntryPoints = async () => {
	const { settings } = getConfig();

	const normalizeRoute = (route) => {
		if (route.length === 0 || route === '/') {
			return '';
		}

		if (route.startsWith('/')) {
			route = route.substring(1, route.length);
		}
		if (!route.endsWith('/')) {
			route = `${route}/`;
		}
		return route;
	};

	const pages = JSON.parse(fs.readFileSync(settings._generated.manifest, 'UTF-8')).pages;

	if (typeof settings.export?.pages === 'function') {
		return (await settings.export.pages(pages.map((page) => page.route))).map((page) => normalizeRoute(page));
	}

	return pages.filter((page) => !page.fallback).map((page) => normalizeRoute(page.route));
};

const groupEntryPoints = (entryPoints) => {
	const chunkSize = 100;
	let i, j;

	const chunks = [];

	for (i = 0, j = entryPoints.length; i < j; i += chunkSize) {
		chunks.push(entryPoints.slice(i, i + chunkSize));
	}

	return chunks;
};

const generateStaticSite = async (
	{ outputDirectory = false, clean = true } = { outputDirectory: false, clean: true },
) => {
	const { settings } = getConfig();

	outputDirectory = outputDirectory || settings.export.output;

	const entryChunks = groupEntryPoints(await getStaticSiteEntryPoints());
	if (clean) {
		// Clean the export output directory before exporting again.
		rimraf.sync(outputDirectory);
	}

	await startLunaJS();

	const url = `http://localhost:${settings.port}`;

	for (const entryChunk of entryChunks) {
		await Promise.all(
			entryChunk.map(async (route) => {
				const response = await fetch(`${url}/${route}`);
				const renderedPage = await response.text();

				let pageDirectory = path.join(outputDirectory, 'public', route);

				try {
					fs.mkdirSync(pageDirectory, { recursive: true });
				} catch {}

				fs.writeFileSync(path.join(pageDirectory, 'index.html'), renderedPage, {
					encoding: 'UTF-8',
				});
			}),
		);
	}

	const directoriesToCopy = [...(settings.export?.api?.include ?? [])].map((directory) => {
		const inputPath = path.posix.join(settings.build.output, directory);
		return {
			input: inputPath,
			output: path.posix.join(outputDirectory, directory),
			isFile: fs.lstatSync(inputPath).isFile(),
		};
	});

	directoriesToCopy.push({
		input: settings.publicDirectory,
		output: path.posix.join(outputDirectory, 'public'),
	});

	for (const directory of directoriesToCopy) {
		const filesToCopy = directory.isFile ? [directory.input] : glob.sync(path.join(directory.input, '**/*'));

		filesToCopy.forEach((file) => {
			if (fs.lstatSync(file).isDirectory()) {
				return;
			}

			const relativePath = directory.isFile ? '.' : file.substring(directory.input.length);
			const publicAssetDirectory = path.dirname(path.join(directory.output, relativePath));

			fs.mkdirSync(publicAssetDirectory, { recursive: true });
			fs.copyFileSync(file, path.join(directory.output, relativePath));
		});
	}

	await stopLunaJS();
};

export { generateStaticSite };
