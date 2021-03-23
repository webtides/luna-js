import {loadPages, generatePageMarkup} from "../../loaders/pages-loader.js";
import ssr from "../../engine/document-renderer.js";
import { loadApis} from "../../loaders/api-loader";
import {loadManifest} from "../../config";

let currentRouter;

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

const routes = async ({router}) => {
    currentRouter = router;

    const {pages, fallbackPage} = await loadPages();
    const {apis, fallbackApi} = await loadApis();

    const registerPageRoute = async ({module, route}) => {
        const callback = async ({ request, response }) => {
            const {html} = await generatePageMarkup({route, module, request, response});
            const result = await ssr(html, {request, response});

            if (request.luna?.isCacheable) {
                request.luna.cachedResponse = result;
            }

            return response.send(result);
        };

        registerRoute({ router, route, middleware: module.middleware }, {
            get: callback,
            post: callback
        })

        console.log(`Registered route ${route}`);
    }

    const registerApiRoute = async ({route, module}) => {
        const { middleware } = module;

        const apiModule = module.module;
        registerRoute({ router, route, middleware }, {
            get: apiModule.get ?? apiModule.default ?? apiModule,
            post: apiModule.post
        });

        console.log(`Registered api route ${route}`);
    };

    for (const page of pages) {
        await registerPageRoute(page);
    }

    for (const api of apis) {
        await registerApiRoute(api);
    }

    if (fallbackApi) {
        await registerApiRoute(fallbackApi);
    }

    if (fallbackPage) {
        await registerPageRoute(fallbackPage);
    }
};

export {routes, currentRouter};
