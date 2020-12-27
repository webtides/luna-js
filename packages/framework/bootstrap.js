// const fs = require("fs");
//
// require.extensions['.css'] = function (module, filename) {
//     module.exports = fs.readFileSync(filename, 'utf8');
// };

import {html, renderToString} from "@popeindustries/lit-html-server";

global.HTMLElement = class {};
global.customElements = {
    define(name, element) {},
};
global.window = {};
global.document = {
    getElementById() {},
};

global.html = html;
global.render = renderToString;
