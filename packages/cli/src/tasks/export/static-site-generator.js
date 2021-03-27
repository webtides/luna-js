import {loadPages, generatePageMarkup} from "@webtides/luna-js/lib/framework/loaders/pages-loader";
import ssr from "@webtides/luna-js/lib/framework/engine/document-renderer";
import {loadSettings} from "@webtides/luna-js/lib/framework/config";

import fs from "fs";
import path from "path";
import glob from "glob";

const generateStaticSite = async ({ outputDirectory = false } = { }) => {
    const settings = await loadSettings();

    outputDirectory = outputDirectory || settings.export.outputDirectory;

    const {pages} = await loadPages();
    await Promise.all(pages.map(async ({ module, route }) => {
        const {html} = await generatePageMarkup({module, request: false, response: false });
        const renderedPage = await ssr(html, { request: false, response: false });

        let pageDirectory = path.join(outputDirectory, "public", route);

        try {
            fs.mkdirSync(pageDirectory, {recursive: true});
        } catch {}

        fs.writeFileSync(path.join(pageDirectory, "index.html"), renderedPage, {
            encoding: "UTF-8"
        });

        const directoriesToCopy = [
            ...(settings.export?.api?.include ?? [])
        ].map(directory => {
            return {
                input: path.posix.join(settings.build.output, directory),
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
