import './bootstrap.js';

import express from 'express';
import expressPosthtml from 'express-posthtml';
import ssr from './engine/posthtml-ssr-custom-elements.js';
import {routes} from "./router/routes.js";
const app = express();
const port = 3001;

const plugins = [
    ssr(),
]

app.engine('html', expressPosthtml);
app.set('view options', {plugins: plugins, options: {}});
app.use(express.static('public'));

routes({router: app});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
