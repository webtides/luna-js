"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareServer = exports.restartServer = exports.startServer = exports.stopServer = void 0;

require("./bootstrap.js");

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _routes = require("./http/router/routes.js");

var _componentLoader = require("./loaders/component-loader.js");

var _hooks = require("./hooks");

var _hooksLoader = require("./loaders/hooks-loader");

var _definitions = require("./hooks/definitions");

var _middleware = require("./http/middleware");

var _config = require("./config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let app;
let server;
let port;

const prepareServer = async () => {
  var _settings$port;

  const settings = await (0, _config.loadSettings)();

  if (!settings) {
    console.log("Could not start moon.js. Have you created your moon.config.js?");
    return;
  }

  app = (0, _express.default)();
  app.use(_bodyParser.default.json());
  app.use(_bodyParser.default.urlencoded());
  app.use(_express.default.static('.build/public'));
  port = (_settings$port = settings.port) !== null && _settings$port !== void 0 ? _settings$port : 3005;
  await (0, _hooksLoader.loadHooks)();
  await (0, _hooks.callHook)(_definitions.HOOKS.HOOKS_LOADED);
  await (0, _componentLoader.registerAvailableComponents)({
    generateCssBundles: !(await (0, _config.loadManifest)())
  });
  await (0, _hooks.callHook)(_definitions.HOOKS.COMPONENTS_LOADED, {
    components: (0, _componentLoader.getAvailableComponents)()
  });
  await (0, _hooks.callHook)(_definitions.HOOKS.ROUTES_BEFORE_REGISTER, {
    router: app
  });
  await (0, _middleware.registerMiddleware)({
    app
  });
  await (0, _routes.routes)({
    router: app
  });
  await (0, _hooks.callHook)(_definitions.HOOKS.ROUTES_AFTER_REGISTER, {
    router: app
  });
  return app;
};

exports.prepareServer = prepareServer;

const startServer = async () => {
  console.log("Staring moon.js");
  await prepareServer();
  server = app.listen(port, async () => {
    console.log(`moon.js listening at: http://localhost:${port}`);
    await (0, _hooks.callHook)(_definitions.HOOKS.SERVER_STARTED, {
      app
    });
  });
};

exports.startServer = startServer;

const stopServer = async () => {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
};

exports.stopServer = stopServer;

const restartServer = async () => {
  await stopServer();
  return startServer();
};

exports.restartServer = restartServer;