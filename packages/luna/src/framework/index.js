import './bootstrap.js';

import express from 'express';
import bodyParser from "body-parser";
import {routes} from "./http/router/routes.js";
import {callHook} from "./hooks";
import {HOOKS} from "./hooks/definitions";
import {registerMiddleware} from "./http/middleware";
import {getSettings} from "./config";
import {initializeLuna, prepareLuna} from "./luna";
import {cacheMiddleware} from "./http/middleware/cache-middleware";
import ServiceDefinitions from "./services";

let app;
let server;
let port;

let connections = [];

const prepareServer = async () => {
    const componentLoader = ServiceContainer.get(ServiceDefinitions.ComponentLoader);

    if (!(await prepareLuna())) {
        console.log("Could not start luna-js. Have you created your luna.config.js?");
        return;
    }

    await initializeLuna();

    const settings = getSettings();

    await callHook(HOOKS.HOOKS_LOADED);

    app = express();

    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    app.use(express.static('.build/public'));

    port = settings.port;

    await componentLoader.registerAvailableComponents();

    await callHook(HOOKS.COMPONENTS_LOADED, {
        components: componentLoader.getAvailableComponents()
    });

    await callHook(HOOKS.ROUTES_BEFORE_REGISTER, {
        router: app
    });

    await registerMiddleware({ app });

    app.use(cacheMiddleware());

    await routes({router: app});

    await callHook(HOOKS.ROUTES_AFTER_REGISTER, {
        router: app
    });

    return app;
}

const startServer = async () => {
    return new Promise(async (resolve, reject) => {
        console.log("Starting luna-js");

        await prepareServer();

        server = app.listen(port, async () => {
            console.log(`luna-js listening at: http://localhost:${port}`)

            await callHook(HOOKS.SERVER_STARTED, {
                app
            });

            resolve();
        });

        server.on('connection', connection => {
            connections.push(connection);
            connection.on('close', () => connections = connections.filter(curr => curr !== connection));
        });
    });
};

const stopServer = async () => {
    return new Promise((resolve, reject) => {
        if (server) {
            connections.forEach(connection => connection.destroy());
            server.close(() => resolve());
        } else {
            resolve();
        }
    })
}

const restartServer = async () => {
    await stopServer();
    return startServer();
}

export { stopServer, startServer, restartServer, prepareServer };
