"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerMiddleware = void 0;

var _hookMiddleware = _interopRequireDefault(require("./hook-middleware"));

var _hooks = require("../../hooks");

var _definitions = require("../../hooks/definitions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const registerMiddleware = async ({
  app
}) => {
  await (0, _hooks.callHook)(_definitions.HOOKS.MIDDLEWARE_REGISTER, {
    app
  });
  (0, _hookMiddleware.default)({
    app
  });
};

exports.registerMiddleware = registerMiddleware;