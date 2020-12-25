import {loadPages, loadSinglePage} from "./pages-loader.js";
import posthtml from 'posthtml'
import ssr from '../engine/posthtml-ssr-custom-elements.js';

const routes = ({ router }) => {
    const pages = loadPages();

    pages.forEach(({ file, name, relativePath }) => {
        router.get(name, async (request, response) => {
            const page = await loadSinglePage({file});

            const result = await posthtml()
                .use(ssr())
                .process(page);

            console.log(result.html);

            return response.send(result.html);
        });

        console.log(`Registered route ${name}.`);
    });
};

export { routes };
