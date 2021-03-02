import {loadPages, generatePageMarkup} from "../../loaders/pages-loader.js";
import ssr from "../../engine/document-renderer.js";
import {loadApis} from "../../loaders/api-loader";
import path from "path";
import {loadSettings} from "../../config";

let currentRouter;

const getRouteName = (name) => {
    name = name.replace(/\[(.*)]/, ":$1");

    if (name.endsWith("/index")) {
        return name.substring(0, name.length - "/index".length);
    }

    return name;
};

const isRouteWithParam = name => {
    const regex = new RegExp(/\[(.*)]/);
    return regex.test(name);
}

const routes = async ({router}) => {
    currentRouter = router;

    const pages = await loadPages();
    const settings = await loadSettings();

    const fallbackRoute = settings.fallbackRoute ?? false;
    const fallbackApiRoute = settings.fallbackApiRoute ?? false;

    let fallbackPage = false,
        fallbackApi = false;

    const registerPageRoute = async ({module, name}) => {
        const route = getRouteName(name);

        router.get(route, async (request, response) => {
            console.log("Calling", route, request.path);
            const {html} = await generatePageMarkup({module, request, response});
            return response.send(await ssr(html, {request, response}));
        });

        router.post(route, async (request, response) => {
            const {html} = await generatePageMarkup({module, request, response});
            return response.send(await ssr(html, {request, response}));
        })

        console.log(`Registered route ${route}.`);
    }

    const registerApiRoute = async ({file, name}) => {
        const module = (require(path.resolve(file)));

        const get = module.get || module;
        const post = module.post;

        get && router.get(`/api${name}`, (request, response) => {
            try {
                return get({request, response});
            } catch (error) {
                return response.status(500);
            }
        });

        post && router.post(`/api${name}`, (request, response) => {
            try {
                return post({request, response});
            } catch (error) {
                return response.status(500);
            }
        });

        console.log("Registered api routes for", name);
    };

    const sortedPages = pages.sort((a, b) => {
        if (isRouteWithParam(a.name) && !isRouteWithParam(b.name)) {
            return 1;
        } else if (isRouteWithParam(b.name) && !isRouteWithParam(a.name)) {
            return -1;
        }
        return 0;
    });

    for (let i = 0; i < sortedPages.length; i++) {
        const page = sortedPages[i];

        if (page.name === fallbackRoute) {
            fallbackPage = page;
            continue;
        }

        await registerPageRoute(page);
    }

    const apis = await loadApis();
    apis.map(async ({file, name, relativePath}) => {
        if (name === fallbackApiRoute) {
            fallbackApi = {file, name};
            return;
        }

        await registerApiRoute({file, name});
    });

    if (fallbackApi) {
        await registerApiRoute({
            file: fallbackApi.file,
            name: "/*"
        });
    }

    if (fallbackPage) {
        await registerPageRoute({ module: fallbackPage.module, name: "*" });
    }
};

export {routes, currentRouter};
