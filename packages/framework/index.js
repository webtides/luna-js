import './bootstrap.js';

import express from 'express';
import {routes} from "./router/routes.js";
import {registerAvailableComponents} from "./loaders/component-loader";
const app = express();
const port = 3005;

app.use(express.static('.build/public'));

(async () => {
    await registerAvailableComponents();

    await routes({router: app});

    app.listen(port, () => {
        console.log(`moon.js listening at: http://localhost:${port}`)
    });
})();

