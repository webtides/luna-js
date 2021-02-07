import {prepareServer} from "@webtides/moon-js/build/entries/helpers/prepare";

const apisToRegister = [];
__IMPORTS__

(async () => {
    const port = __PORT__;

    const app = await prepareServer({
        apis: apisToRegister,
        fallbackApiRoute: __FALLBACK_API_ROUTE__,
        serveStaticSite: __SERVE_STATIC_SITE__
    });

    app.listen(port, async () => {
        console.log(`Server listening on port ${port}.`);
    });
})();