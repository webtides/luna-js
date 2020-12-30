import {loadPages, loadSinglePage} from "../loaders/pages-loader.js";
import ssr from "./element-renderer.js";
import fs from "fs";
import path from "path";
import glob from "glob";
import config from "../config";

const generateStaticSite = async () => {
    const outputDirectory = ".build/static";

    const pages = loadPages();
    await Promise.all(pages.map(async ({ file, name, relativePath }) => {
        const page = await loadSinglePage({file});
        const renderedPage = await ssr(page);

        const pageDirectory = path.join(outputDirectory, name);

        if (name === "/index") {
            fs.writeFileSync(path.join(outputDirectory, "index.html"), renderedPage, {
                encoding: "UTF-8"
            });
        } else {
            fs.mkdirSync(pageDirectory, {recursive: true});
            fs.writeFileSync(path.join(pageDirectory, "index.html"), renderedPage, {
                encoding: "UTF-8"
            });
        }

        await Promise.all(glob.sync(`.build/public/**/*`).map((file) => {
            if (fs.lstatSync(file).isDirectory()) {
                return;
            }

            const relativePath = file.substring(config.pagesDirectory.length);
            const publicAssetDirectory = path.dirname(path.join(".build/static", relativePath));

            fs.mkdirSync(publicAssetDirectory, { recursive: true });
            fs.copyFileSync(file, path.join(".build/static", relativePath));
        }));

    }));
};

export {
    generateStaticSite
}
