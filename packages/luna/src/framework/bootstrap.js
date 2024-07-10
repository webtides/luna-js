import dotenv from 'dotenv';
dotenv.config();

// TODO: allow browser globals as externals

// TODO: maybe load DOM shim from custom renderer?!

global.HTMLElement = class {};

global.SSR = true;

global.CustomEvent = class {};
global.currentWorkingDirectory = process.cwd();
