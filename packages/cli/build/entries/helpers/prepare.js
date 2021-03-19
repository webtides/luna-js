import express from "express";
import bodyParser from "body-parser";
import path from "path";

import {callHook, registerHook} from "@webtides/luna-js/lib/framework/hooks";
import {HOOKS} from "@webtides/luna-js/lib/framework/hooks/definitions";

/**
 * A helper method for our api generator. Takes an array of hooks and apis, and then tries
 * to simulate the original luna-js behaviour as close as possible.
 *
 * @param hooks
 * @param apis
 * @param fallbackApiRoute
 * @param serveStaticSite
 * @returns {Promise<Express>}
 */
const prepareApiServer = async ({ hooks, apis, fallbackApiRoute, serveStaticSite }) => {
    const app = express();

    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    for (const hook of hooks) {
        registerHook(hook.module.name, hook.module.default);
    }

    await callHook(HOOKS.HOOKS_LOADED);

    await callHook(HOOKS.ROUTES_BEFORE_REGISTER, {
        router: app
    });

    await callHook(HOOKS.MIDDLEWARE_REGISTER, {
        app
    });

    app.use(async (request, response, next) => {
        await callHook(HOOKS.REQUEST_RECEIVED, { request, response });
        next();
    });

    serveStaticSite && app.use(express.static(path.join(__dirname, "public")));

    let fallbackApi = null;

    apis.forEach(api => {
        const { module, name } = api;

        const get = module.get || module.default;
        const post = module.post;

        // This route is going to be our fallback route. Mark it as such.
        if (name === fallbackApiRoute) {
            fallbackApi = {
                name,
                methods: { get, post }
            };
            return;
        }

        registerApiRoute(app, name, { get, post });
    });

    if (fallbackApi) {
        registerApiRoute(app, "*", fallbackApi.methods);
    }

    await callHook(HOOKS.ROUTES_AFTER_REGISTER, {
        router: app
    });

    return app;
};

const registerApiRoute = (router, name, { get, post }) => {
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


export {
    callHook,
    HOOKS,
    prepareApiServer
}
