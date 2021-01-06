import './bootstrap.js';

import express from 'express';
import bodyParser from "body-parser";
import {routes} from "./http/router/routes.js";
import {getAvailableComponents, registerAvailableComponents} from "./loaders/component-loader.js";
import {callHook} from "./hooks";
import {loadHooks} from "./loaders/hooks-loader";
import {HOOKS} from "./hooks/definitions";
import {registerMiddleware} from "./http/middleware";
import {loadSettings} from "./config";

let app;
let server;

const startServer = async () => {
    const settings = await loadSettings();

    if (!settings) {
        console.log("Could not start moon.js. Have you created your moon.config.js?");
        return;
    }

    app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(express.static('.build/public'));

    const port = settings.port ?? 3005;
    await loadHooks();

    await callHook(HOOKS.HOOKS_LOADED);

    await registerAvailableComponents();

    await callHook(HOOKS.COMPONENTS_LOADED, {
        components: getAvailableComponents()
    });

    await callHook(HOOKS.ROUTES_BEFORE_REGISTER, {
        router: app
    });

    await registerMiddleware({ app });
    await routes({router: app});

    await callHook(HOOKS.ROUTES_AFTER_REGISTER, {
        router: app
    });

    server = app.listen(port, async () => {
        console.log(`moon.js listening at: http://localhost:${port}`)

        await callHook(HOOKS.SERVER_STARTED, {
            app
        });
    });
};

const stopServer = async () => {
    return new Promise((resolve, reject) => {
        if (server) {
            server.close(() => resolve());
        }
    })
}

const restartServer = async () => {
    await stopServer();
    startServer();
}

export { stopServer, startServer, restartServer };
