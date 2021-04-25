import dotenv from "dotenv";
dotenv.config();

import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<html><head></head><body></body></html>`);

global.window = dom.window;
global.document = dom.window.document;
global.customElements = dom.window.customElements;
global.Document = {
    prototype: {}
};

global.btoa = (text) => Buffer.from(text).toString('base64')

// import * as litHtml from "@popeindustries/lit-html-server";
// import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";
// import {guard} from "@popeindustries/lit-html-server/directives/guard";
// import {until} from "@popeindustries/lit-html-server/directives/until";

// TODO: allow browser globals as externals

global.SSR = true;
global.HTMLElement = class {};

global.CustomEvent = class {};

// global.serverLitHtml = litHtml;
// global.serverUnsafeHtml = {
//     unsafeHTML: unsafeHTML
// };
// global.serverGuard = {
//     guard: guard
// };
// global.serverUntil = {
//     until: until
// };
global.currentWorkingDirectory = process.cwd();
