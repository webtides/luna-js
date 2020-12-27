import {loadPages, loadSinglePage} from "./pages-loader.js";
import ssr from "../engine/element-renderer.js";

const routes = ({ router }) => {
    const pages = loadPages();

    pages.forEach(({ file, name, relativePath }) => {
        router.get(name, async (request, response) => {
            const page = await loadSinglePage({file});
            return response.send(await ssr(page));
        });

        console.log(`Registered route ${name}.`);
    });
};

export { routes };
