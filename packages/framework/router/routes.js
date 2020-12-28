import {loadPages, loadSinglePage} from "../engine/pages-loader.js";
import ssr from "../engine/element-renderer.js";

const routes = ({ router }) => {
    const pages = loadPages();

    pages.forEach(({ file, name, relativePath }) => {
        console.log(`Trying to register route ${name}.`);

        router.get(name, async (request, response) => {
            console.log(`Fetching page ${name}`);

            const page = await loadSinglePage({file});
            return response.send(await ssr(page));
        });

        console.log(`Registered route ${name}.`);
    });
};

export { routes };
