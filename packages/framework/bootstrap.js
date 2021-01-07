import {callHook} from "./hooks";
import {html, renderToString} from "@popeindustries/lit-html-server";
import { unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";
import {HOOKS} from "./hooks/definitions";
import fs from "fs";

require.extensions['.css'] = function (module, filename) {
    const file = fs.readFileSync(filename, 'utf8');

    const result = callHook(HOOKS.CSS_LOAD, { css: file });

    module.exports = result.css;
};

global.SSR = true;
global.HTMLElement = class {};

global.window = {};
global.document = {
    getElementById() {},
};

global.html = html;
global.render = renderToString;
global.unsafeHTML = unsafeHTML;
