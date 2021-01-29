// Generated file. Do not modify.
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";

import path from "path";

const apisToRegister = [];
__IMPORTS__

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

const startServer = async () => {
    const port = __PORT__;

    const app = express();

    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    __STATIC_SITE__

    let fallbackApi = null;

    apisToRegister.forEach(api => {
        const { module, name } = api;

        const get = module.get || module.default;
        const post = module.post;

        if (name === __FALLBACK_API_ROUTE__) {
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

    app.listen(port, async () => {
        console.log(`Server listening on port ${port}.`);
    });
};


startServer();
