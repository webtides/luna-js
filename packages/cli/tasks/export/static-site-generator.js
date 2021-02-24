import {loadPageMetaData, loadPages, loadSinglePage} from "../../../framework/loaders/pages-loader.js";
import ssr from "../../../framework/engine/document-renderer.js";
import fs from "fs";
import path from "path";
import glob from "glob";
import config, {loadSettings} from "../../../framework/config";

const generateStaticSite = async ({ outputDirectory = false } = { }) => {
    const settings = await loadSettings();

    outputDirectory = outputDirectory || settings.export.outputDirectory;

    const pages = await loadPages();
    await Promise.all(pages.map(async ({ file, name, relativePath }) => {
        const {page} = await loadPageMetaData({file});

        const {html} = await loadSinglePage({page, request: false, response: false });
        const renderedPage = await ssr(html, { request: false, response: false });

        let pageDirectory = path.join(outputDirectory, "public", name);

        if (pageDirectory.endsWith("index")) {
            pageDirectory = path.join(pageDirectory, "..");
        }

        fs.mkdirSync(pageDirectory, {recursive: true});
        fs.writeFileSync(path.join(pageDirectory, "index.html"), renderedPage, {
            encoding: "UTF-8"
        });

        const directoriesToCopy = [
            ...(settings.export?.api?.include ?? [])
        ].map(directory => {
            return {
                input: path.posix.join(settings.buildDirectory, directory),
                output: path.posix.join(outputDirectory, directory)
            }
        });

        directoriesToCopy.push({
            input: settings.publicDirectory,
            output: path.posix.join(outputDirectory, 'public')
        });

        for (const directory of directoriesToCopy) {
            await Promise.all(glob.sync(path.join(directory.input, "**/*")).map((file) => {
                if (fs.lstatSync(file).isDirectory()) {
                    return;
                }

                const relativePath = file.substring(directory.input.length);
                const publicAssetDirectory = path.dirname(path.join(directory.output, relativePath));

                fs.mkdirSync(publicAssetDirectory, { recursive: true });
                fs.copyFileSync(file, path.join(directory.output, relativePath));
            }));
        }

    }));
};

export {
    generateStaticSite
}