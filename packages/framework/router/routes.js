import {loadPages, loadSinglePage} from "../loaders/pages-loader.js";
import ssr from "../engine/element-renderer.js";
import {loadApis} from "../loaders/api-loader";
import path from "path";

const routes = async ({ router }) => {
    const pages = loadPages();

    pages.forEach(({ file, name, relativePath }) => {
        console.log(`Trying to register route ${name}.`);

        const route = name.endsWith("/index") ? name.substring(0, name.length - "/index".length) : name;

        router.get(route, async (request, response) => {
            console.log(`Fetching page ${name}`);

            const page = await loadSinglePage({file});
            return response.send(await ssr(page));
        });

        console.log(`Registered route ${name}.`);
    });

    const apis = await loadApis();
    apis.map(async ({ file, name, relativePath }) => {
        const module = (await import(path.resolve(file)));

        const get = module.get || module.default;
        const post = module.post;

        get && router.get(`/api/${name}`, (request, response) => {
            return get({ request, response });
        });

        post && router.post(`/api/${name}`, (request, response) => {
            return post({ request, response });
        });

        console.log("Registered api routes for", name);
    });
};

export { routes };
