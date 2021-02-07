// Generated file. Do not modify.
import dotenv from "dotenv";
dotenv.config();


import express from "express";
import bodyParser from "body-parser";
import path from "path";

const prepareServer = async ({ apis, fallbackApiRoute, serveStaticSite }) => {
    const app = express();

    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    serveStaticSite && app.use(express.static(path.join(__dirname, "public")));

    let fallbackApi = null;

    apis.forEach(api => {
        const { module, name } = api;

        const get = module.get || module.default;
        const post = module.post;

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
    registerApiRoute,
    prepareServer
}