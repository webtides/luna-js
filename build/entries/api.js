import {prepareServer} from "@webtides/moon-js/build/entries/helpers/prepare";
import {callHook} from "@webtides/moon-js/packages/framework/hooks";
import {HOOKS} from "@webtides/moon-js/packages/framework/hooks/definitions";

const apisToRegister = [];
const hooksToRegister = [];
__IMPORTS__

(async () => {
    const port = __PORT__;

    const app = await prepareServer({
        hooks: hooksToRegister,
        apis: apisToRegister,
        fallbackApiRoute: __FALLBACK_API_ROUTE__,
        serveStaticSite: __SERVE_STATIC_SITE__
    });

    app.listen(port, async () => {

        await callHook(HOOKS.SERVER_STARTED, {
            app
        });

        console.log(`Server listening on port ${port}.`);
    });
})();
