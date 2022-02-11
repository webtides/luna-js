import PagesLoader from "../../loaders/pages-loader";
import ApiLoader from "../../loaders/api-loader";
import DocumentRenderer from "../../engine/document-renderer";
import ServiceContext from "../../services/service-context";
import PagesRenderer from "../../engine/pages-renderer";

let currentRouter;

/**
 * Helper method for registering a single route. Normalized the
 * route method and registers post/get routes if available.
 *
 * @param {{router: *, route: string, middleware: *[]}}
 *
 * @param getMethod
 * @param postMethod
 * @param putMethod
 * @param deleteMethod
 */
const registerRoute = ({router, route, middleware = []}, {
        getMethod = null, postMethod = null, putMethod = null, deleteMethod = null,
    }) => {
        const normalizeRoute = (method) => {
            return (request, response) => {

                // Create a new service context for better dependency injection
                // for api routes.
                const container = new ServiceContext({
                    $$luna: {
                        request,
                        response
                    }
                });

                return method({request, response, container});
            }
        };

        getMethod && (
            router.get(route, middleware, normalizeRoute(getMethod))
        );

        postMethod && (
            router.post(route, middleware, normalizeRoute(postMethod))
        );

        putMethod && (
            router.put(route, middleware, normalizeRoute(putMethod))
        );

        deleteMethod && (
            router.delete(route, middleware, normalizeRoute(deleteMethod))
        );
    }
;

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

    const pagesLoader = luna.get(PagesLoader);
    const pagesRenderer = luna.get(PagesRenderer);

    const {pages, fallbackPage} = await pagesLoader.loadPages();
    const {apis, fallbackApi} = await luna.get(ApiLoader).loadApis();

    const registerPageRoute = async ({module, route}) => {
        const callback = async ({request, response, container}) => {
            const pageMarkup = await pagesRenderer.generatePageMarkup({route, module, request, response, container});

            if (!pageMarkup) {
                return response.status(404).send();
            }

            const documentRenderer = new DocumentRenderer({request, response});

            const result = await documentRenderer.render(pageMarkup);

            if (request.$$luna?.isCacheable) {
                request.$$luna.cachedResponse = result;
            }

            return response.send(result);
        };

        registerRoute({router, route, middleware: module.middleware}, {
            getMethod: callback,
            postMethod: callback
        })

        console.log(`Registered route ${route}`);
    }

    const registerApiRoute = async ({route, module}) => {
        const {middleware} = module;

        const apiModule = module.module;
        registerRoute({router, route, middleware}, {
            getMethod: apiModule.get ?? apiModule.default ?? apiModule,
            postMethod: apiModule.post,
            putMethod: apiModule.put,
            deleteMethod: apiModule.remove, // This has to be `remove` because `delete` is a reserved keyword.
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
