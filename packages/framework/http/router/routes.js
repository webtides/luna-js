import {loadPages, generatePageMarkup} from "../../loaders/pages-loader.js";
import ssr from "../../engine/document-renderer.js";
import {loadApis} from "../../loaders/api-loader";
import path from "path";
import {loadSettings} from "../../config";
import {parseMiddleware} from "../middleware";

let currentRouter;

const getRouteName = (name) => {
    name = name.replace(/\[(\w*)]/g, ":$1");

    if (name.endsWith("/index")) {
        return name.substring(0, name.length - "/index".length);
    }

    return name;
};

const isRouteWithParam = name => {
    const regex = new RegExp(/\[(.*)]/);
    return regex.test(name);
};

const registerRoute = ({ router, route, middleware = [] }, { get = null, post = null }) => {
    const normalizeRoute = (method) => {
        return (request, response) => method({ request, response });
    };

    get && (
        router.get(route, middleware, normalizeRoute(get))
    );

    post && (
        router.post(route, middleware, normalizeRoute(post))
    );
};

const sortRoutes = (routes) => {
    return routes.sort((a, b) => {
        if (isRouteWithParam(a.name) && !isRouteWithParam(b.name)) {
            return 1;
        } else if (isRouteWithParam(b.name) && !isRouteWithParam(a.name)) {
            return -1;
        }
        return 0;
    });
};

const routes = async ({router}) => {
    currentRouter = router;

    const pages = sortRoutes(await loadPages());
    const apis = sortRoutes(await loadApis());

    const settings = await loadSettings();

    const fallbackRoute = settings.fallbackRoute ?? false;
    const fallbackApiRoute = settings.fallbackApiRoute ?? false;

    let fallbackPage = false,
        fallbackApi = false;

    const registerPageRoute = async ({module, name}) => {
        const route = getRouteName(name);

        const callback = async ({ request, response }) => {
            const {html} = await generatePageMarkup({route, module, request, response});
            const result = await ssr(html, {request, response});

            if (request.moon?.isCacheable) {
                request.moon.cachedResponse = result;
            }

            return response.send(result);
        };

        registerRoute({ router, route, middleware: module.middleware }, {
            get: callback,
            post: callback
        })

        console.log(`Registered route ${route}`);
    }

    const registerApiRoute = async ({route, file}) => {
        const module = require(path.resolve(file));
        route = getRouteName(route);

        const middleware = await parseMiddleware({ middleware: module.middleware });

        registerRoute({ router, route, middleware }, {
            get: module.get ?? module.default ?? module,
            post: module.post
        });

        console.log(`Registered api route ${route}`);
    };

    for (const page of pages) {
        if (page.name === fallbackRoute) {
            fallbackPage = page;
            continue;
        }

        await registerPageRoute(page);
    }

    for (const api of apis) {
        if (api.name === fallbackApiRoute) {
            fallbackApi = api;
            continue;
        }

        await registerApiRoute(api);
    }

    if (fallbackApi) {
        await registerApiRoute({ file: fallbackApi.file, route: "/*" });
    }

    if (fallbackPage) {
        await registerPageRoute({ module: fallbackPage.module, name: "*" });
    }
};

export {routes, currentRouter};
