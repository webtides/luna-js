import './bootstrap.js';

import express from 'express';
import bodyParser from "body-parser";
import {routes} from "./http/router/routes.js";
import {getAvailableComponents, registerAvailableComponents} from "./loaders/component-loader.js";
import {callHook} from "./hooks";
import {loadHooks} from "./loaders/hooks-loader";
import {HOOKS} from "./hooks/definitions";
import {registerMiddleware} from "./http/middleware";
const app = express();
const port = 3005;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static('.build/public'));

(async () => {
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

    app.listen(port, async () => {
        console.log(`moon.js listening at: http://localhost:${port}`)

        await callHook(HOOKS.SERVER_STARTED, {
            app
        });
    });
})();

