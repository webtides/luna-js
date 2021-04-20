import ServiceDefinitions from "../../services";

let currentRouter;

/**
 * Helper method for registering a single route. Normalized the
 * route method and registers post/get routes if available.
 *
 * @param {{router: *, route: string, middleware: *[]}}
 * @param {{ get: *, post: *}}
 */
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

/**
 * The main routing part of our application. All pages
 * and apis are being registered here.
 *
 * @param router                The express app or an express router.
 *
 * @returns {Promise<void>}
 */
const routes = async ({router}) => {
    currentRouter = router;

    const pagesLoader = luna.get(ServiceDefinitions.PagesLoader);
    const documentRenderer = luna.get(ServiceDefinitions.DocumentRenderer);

    const {pages, fallbackPage} = await pagesLoader.loadPages();
    const {apis, fallbackApi} = await luna.get(ServiceDefinitions.ApiLoader).loadApis();

    const registerPageRoute = async ({module, route}) => {
        const callback = async ({ request, response }) => {
            const {html} = await pagesLoader.generatePageMarkup({route, module, request, response});
            const result = await documentRenderer.render(html, {request, response});

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
