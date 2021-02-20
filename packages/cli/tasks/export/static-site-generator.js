import {loadPages, loadSinglePage} from "../../../framework/loaders/pages-loader.js";
import ssr from "../../../framework/engine/document-renderer.js";
import fs from "fs";
import path from "path";
import glob from "glob";
import {loadSettings} from "../../../framework/config";

const generateStaticSite = async ({ outputDirectory = false } = { }) => {
    const settings = await loadSettings();

    outputDirectory = outputDirectory || settings.export.outputDirectory;

    const pages = await loadPages();
    await Promise.all(pages.map(async ({ file, name, relativePath }) => {
        const {html} = await loadSinglePage({file, request: false, response: false });
        const renderedPage = await ssr(html, { request: false, response: false });

        let pageDirectory = path.join(outputDirectory, name);

        if (pageDirectory.endsWith("index")) {
            pageDirectory = path.join(pageDirectory, "..");
        }

        fs.mkdirSync(pageDirectory, {recursive: true});
        fs.writeFileSync(path.join(pageDirectory, "index.html"), renderedPage, {
            encoding: "UTF-8"
        });

        await Promise.all(glob.sync(path.join(settings.publicDirectory, "**/*")).map((file) => {
            if (fs.lstatSync(file).isDirectory()) {
                return;
            }

            const relativePath = file.substring(settings.publicDirectory.length);
            const publicAssetDirectory = path.dirname(path.join(outputDirectory, relativePath));

            fs.mkdirSync(publicAssetDirectory, { recursive: true });
            fs.copyFileSync(file, path.join(outputDirectory, relativePath));
        }));

    }));
};

export {
    generateStaticSite
}
