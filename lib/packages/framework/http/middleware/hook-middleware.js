"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hooks = require("../../hooks");

var _definitions = require("../../hooks/definitions");

const register = ({
  app
}) => {
  app.use(async (request, response, next) => {
    await (0, _hooks.callHook)(_definitions.HOOKS.REQUEST_RECEIVED, {
      request,
      response
    });
    next();
  });
};

var _default = register;
exports.default = _default;