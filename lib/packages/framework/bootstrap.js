"use strict";

var _hooks = require("./hooks");

var litHtml = _interopRequireWildcard(require("@popeindustries/lit-html-server"));

var _unsafeHtml = require("@popeindustries/lit-html-server/directives/unsafe-html");

var _definitions = require("./hooks/definitions");

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

require.extensions['.css'] = function (module, filename) {
  const file = _fs.default.readFileSync(filename, 'utf8');

  const result = (0, _hooks.callHook)(_definitions.HOOKS.CSS_LOAD, {
    css: file
  });
  module.exports = result.css;
}; // TODO: allow browser globals as externals


global.SSR = true;
global.HTMLElement = class {};
global.window = {};
global.document = {
  getElementById() {}

};
global.CustomEvent = class {};
global.serverLitHtml = litHtml;
global.serverUnsafeHtml = {
  unsafeHTML: _unsafeHtml.unsafeHTML
};
global.currentWorkingDirectory = process.cwd();