"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.callHook = exports.registerHook = void 0;
const hooks = {};

const registerHook = (name, hook, index = 0) => {
  hooks[name] = hook;
};

exports.registerHook = registerHook;

const callHook = (name, params = false) => {
  if (hooks[name]) {
    return hooks[name](params);
  }

  return params;
};

exports.callHook = callHook;