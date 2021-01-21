"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "html", {
  enumerable: true,
  get: function () {
    return _litHtml.html;
  }
});
Object.defineProperty(exports, "render", {
  enumerable: true,
  get: function () {
    return _litHtml.render;
  }
});
Object.defineProperty(exports, "unsafeHTML", {
  enumerable: true,
  get: function () {
    return _unsafeHtml.unsafeHTML;
  }
});

var _litHtml = require("lit-html");

var _unsafeHtml = require("lit-html/directives/unsafe-html");

window.render = _litHtml.render;