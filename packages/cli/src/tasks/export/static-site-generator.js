import fs from "fs";
import path from "path";
import glob from "glob";

import {getSettings} from "@webtides/luna-js/lib/framework/config";
import {startServer, stopServer} from "@webtides/luna-js/lib/framework";
import {ServiceDefinitions} from "@webtides/luna-js/lib/framework/services";
import PagesLoader from "@webtides/luna-js/lib/framework/loaders/pages-loader";

import fetch from "node-fetch";
import rimraf from "rimraf";

const getStaticSiteEntryPoints = async () => {
    const settings = getSettings();

    const normalizeRoute = (route) => {
        if (route.length === 0 || route === '/') {
            return '';
        }

        if (route.startsWith('/')) {
            route = route.substring(1, route.length)
        }
        if (!route.endsWith('/')) {
            route = `${route}/`
        }
        return route;
    };

    if (typeof settings.export?.entries === 'function') {
        return (await settings.export.entries())
            .map(route => normalizeRoute(route));
    }

    const {pages} = await luna.get(PagesLoader).loadPages();
    return pages
        .filter(page => !page.fallback)
        .map(page => normalizeRoute(page.route));
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

const generateStaticSite = async ({outputDirectory = false, clean = true } = { outputDirectory: false, clean: true }) => {
    const settings = getSettings();

    outputDirectory = outputDirectory || settings.export.output;

    if (clean) {
        // Clean the export output directory before exporting again.
        rimraf.sync(outputDirectory);
    }

    const entryChunks = groupEntryPoints(await getStaticSiteEntryPoints());

    await startServer();

    const url = `http://localhost:${settings.port}`;

    for (const entryChunk of entryChunks) {
        await Promise.all(entryChunk.map(async (route) => {
            const response = await fetch(`${url}/${route}`);
            const renderedPage = await response.text();

            let pageDirectory = path.join(outputDirectory, "public", route);

            try {
                fs.mkdirSync(pageDirectory, {recursive: true});
            } catch {
            }

            fs.writeFileSync(path.join(pageDirectory, "index.html"), renderedPage, {
                encoding: "UTF-8"
            });
        }));
    }

    const directoriesToCopy = [
        ...(settings.export?.api?.include ?? [])
    ].map(directory => {
        const inputPath = path.posix.join(settings.build.output, directory);
            return {
                input: inputPath,
            output: path.posix.join(outputDirectory, directory),
                isFile: fs.lstatSync(inputPath).isFile(),
        }
    });

    directoriesToCopy.push({
        input: settings.publicDirectory,
        output: path.posix.join(outputDirectory, 'public')
    });

    for (const directory of directoriesToCopy) {
        const filesToCopy = directory.isFile ? [ directory.input ] : glob.sync(path.join(directory.input, "**/*"));

            filesToCopy.forEach((file) => {
            if (fs.lstatSync(file).isDirectory()) {
                return;
            }

            const relativePath = directory.isFile ? '.' : file.substring(directory.input.length);
            const publicAssetDirectory = path.dirname(path.join(directory.output, relativePath));

            fs.mkdirSync(publicAssetDirectory, {recursive: true});
            fs.copyFileSync(file, path.join(directory.output, relativePath));
        });
    }

    await stopServer();
};

export {
    generateStaticSite
}
