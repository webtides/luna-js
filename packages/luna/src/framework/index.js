import './bootstrap.js';

import express from 'express';
import bodyParser from "body-parser";
import {routes} from "./http/router/routes.js";
import {getAvailableComponents, registerAvailableComponents} from "./loaders/component-loader.js";
import {callHook} from "./hooks";
import {loadHooks} from "./loaders/hooks-loader";
import {HOOKS} from "./hooks/definitions";
import {registerMiddleware} from "./http/middleware";
import {getSettings} from "./config";
import {initializeLuna} from "./luna";
import {cacheMiddleware} from "./http/middleware/cache-middleware";

let app;
let server;
let port;

let connections = [];

const prepareServer = async () => {
    if (!(await initializeLuna())) {
        console.log("Could not start luna-js. Have you created your luna.config.js?");
        return;
    }

    // Load and register all available hooks.
    await loadHooks();

    global.luna = callHook(HOOKS.LUNA_INITIALIZE, global.luna);

    const settings = getSettings();

    await callHook(HOOKS.HOOKS_LOADED);

    app = express();

    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    app.use(express.static('.build/public'));

    port = settings.port;

    await registerAvailableComponents();

    await callHook(HOOKS.COMPONENTS_LOADED, {
        components: getAvailableComponents()
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
    console.log("Staring luna-js");

    await prepareServer();

    server = app.listen(port, async () => {
        console.log(`luna-js listening at: http://localhost:${port}`)

        await callHook(HOOKS.SERVER_STARTED, {
            app
        });
    });

    server.on('connection', connection => {
        connections.push(connection);
        connection.on('close', () => connections = connections.filter(curr => curr !== connection));
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