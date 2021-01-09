"use strict";

var _hooks = require("./hooks");

var _litHtmlServer = require("@popeindustries/lit-html-server");

var _unsafeHtml = require("@popeindustries/lit-html-server/directives/unsafe-html");

var _definitions = require("./hooks/definitions");

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require.extensions['.css'] = function (module, filename) {
  const file = _fs.default.readFileSync(filename, 'utf8');

  const result = (0, _hooks.callHook)(_definitions.HOOKS.CSS_LOAD, {
    css: file
  });
  module.exports = result.css;
};

global.SSR = true;
global.HTMLElement = class {};
global.window = {};
global.document = {
  getElementById() {}

};
global.html = _litHtmlServer.html;
global.render = _litHtmlServer.renderToString;
global.unsafeHTML = _unsafeHtml.unsafeHTML;