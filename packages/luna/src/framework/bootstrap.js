import dotenv from "dotenv";
dotenv.config();

// TODO: allow browser globals as externals

global.HTMLElement = class {};

global.SSR = true;

global.CustomEvent = class {};
global.currentWorkingDirectory = process.cwd();
