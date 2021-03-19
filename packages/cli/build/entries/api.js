import dotenv from "dotenv";
dotenv.config();

import {prepareApiServer, callHook, HOOKS} from "@webtides/luna-cli/build/entries/helpers/prepare";

const apisToRegister = [];
const hooksToRegister = [];
__IMPORTS__

(async () => {
    const port = __PORT__;

    const app = await prepareApiServer({
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
