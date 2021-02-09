import serverless from "serverless-http";

import {prepareServer} from "@webtides/moon-js/build/entries/helpers/prepare";
import {callHook} from "@webtides/moon-js/packages/framework/hooks";
import {HOOKS} from "@webtides/moon-js/packages/framework/hooks/definitions";

const apisToRegister = [];
const hooksToRegister = [];

__IMPORTS__

const handler = async (event, context) => {
    const app = await prepareServer({
        hooks: hooksToRegister,
        apis: apisToRegister,
        fallbackApiRoute: __FALLBACK_API_ROUTE__,
        serveStaticSite: __SERVE_STATIC_SITE__
    });

    await callHook(HOOKS.SERVER_STARTED, {
        app
    });

    return serverless(app, {
        binary: [ 'image/*', 'application/*' ],
        basePath: '/'
    })(event, context);
};

export { handler };
