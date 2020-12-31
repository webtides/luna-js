import './bootstrap.js';

import express from 'express';
import {routes} from "./router/routes.js";
import {registerAvailableComponents} from "./loaders/component-loader.js";
import {callHook} from "./hooks.js";
import {loadHooks} from "./loaders/hooks-loader";
import {HOOKS} from "./hooks/definitions";
const app = express();
const port = 3005;

app.use(express.static('.build/public'));

(async () => {
    await loadHooks();

    await callHook(HOOKS.HOOKS_LOADED);

    await registerAvailableComponents();

    await callHook(HOOKS.ROUTES_BEFORE_REGISTER, {
        router: app
    });

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

