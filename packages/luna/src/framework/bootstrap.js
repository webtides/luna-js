import dotenv from "dotenv";
dotenv.config();

// TODO: allow browser globals as externals

global.SSR = true;
global.HTMLElement = class {};

global.window = {};
global.document = {
    getElementById() {},
};
global.CustomEvent = class {};

global.currentWorkingDirectory = process.cwd();
