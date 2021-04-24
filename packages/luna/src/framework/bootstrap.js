import { JSDOM } from "jsdom";

const dom = new JSDOM(`<html><head></head><body><div id="template"></div></body></html>`)

global.window = dom.window;
global.document = dom.window.document;

global.HTMLElement = class {};

global.SSR = true;
global.currentWorkingDirectory = process.cwd();

global.CustomEvent = class {};
