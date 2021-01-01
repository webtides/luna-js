import {loadPageMetaData, loadPages, loadSinglePage} from "../../loaders/pages-loader.js";
import ssr from "../../engine/element-renderer.js";
import {loadApis} from "../../loaders/api-loader";
import path from "path";

const routes = async ({ router }) => {
    const pages = await loadPages();

    pages.map(async ({ file, name, relativePath }) => {
        const route = name.endsWith("/index") ? name.substring(0, name.length - "/index".length) : name;

        const { availableMethods, page } = await loadPageMetaData({ file });

        router.get(route, async (request, response) => {
            const { html } = await loadSinglePage({ page, request, response });
            return response.send(await ssr(html, { request, response }));
        });

        if (availableMethods.includes("post")) {
            router.post(route, async (request, response) => {
                const { html } = await loadSinglePage({  page, method: "post", request, response });
                return response.send(await ssr(html, { request, response }));
            })
        }

        console.log(`Registered route ${name}.`);
    });

    const apis = await loadApis();
    apis.map(async ({ file, name, relativePath }) => {
        const module = (await import(path.resolve(file)));

        const get = module.get || module.default;
        const post = module.post;

        get && router.get(`/api${name}`, (request, response) => {
            return get({ request, response });
        });

        post && router.post(`/api${name}`, (request, response) => {
            return post({ request, response });
        });

        console.log("Registered api routes for", name);
    });
};

export { routes };
