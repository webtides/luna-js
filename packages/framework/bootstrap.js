import {callHook} from "./hooks";
import {html, renderToString} from "@popeindustries/lit-html-server";
import {HOOKS} from "./hooks/definitions";

const fs = require("fs");

require.extensions['.css'] = function (module, filename) {
    const file = fs.readFileSync(filename, 'utf8');

    const result = callHook(HOOKS.CSS_LOAD, { css: file });

    module.exports = result.css;
};

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
