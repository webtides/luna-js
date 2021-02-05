import serverless from "serverless-http";

import {prepareServer} from "@webtides/moon-js/build/entries/helpers/prepare";

const apisToRegister = [];
__IMPORTS__

const handler = async (event, context) => {
    const app = await prepareServer({
        apis: apisToRegister,
        fallbackApiRoute: __FALLBACK_API_ROUTE__,
        serveStaticSite: __SERVE_STATIC_SITE__
    });

    return serverless(app, {
        binary: [ 'image/*', 'application/*' ],
        basePath: '/'
    })(event, context);
};

export { handler };
