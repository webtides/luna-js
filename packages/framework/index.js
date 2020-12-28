import './bootstrap.js';

import express from 'express';
import {routes} from "./router/routes.js";
const app = express();
const port = 3005;

app.use(express.static('.build/public'));

routes({router: app});

app.listen(port, () => {
    console.log(`element-js server listening at: http://localhost:${port}`)
})
