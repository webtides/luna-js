import dotenv from "dotenv";
dotenv.config();

import {callHook} from "./hooks";
import * as litHtml from "@popeindustries/lit-html-server";
import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";
import {guard} from "@popeindustries/lit-html-server/directives/guard";
import {until} from "@popeindustries/lit-html-server/directives/until";

// TODO: allow browser globals as externals

global.SSR = true;
global.HTMLElement = class {};

global.window = {};
global.document = {
    getElementById() {},
};
global.CustomEvent = class {};

global.serverLitHtml = litHtml;
global.serverUnsafeHtml = {
    unsafeHTML: unsafeHTML
};
global.serverGuard = {
    guard: guard
};
global.serverUntil = {
    until: until
};
global.currentWorkingDirectory = process.cwd();
