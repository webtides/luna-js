"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "html", {
  enumerable: true,
  get: function () {
    return _litHtmlServer.html;
  }
});
Object.defineProperty(exports, "unsafeHTML", {
  enumerable: true,
  get: function () {
    return _unsafeHtml.unsafeHTML;
  }
});

var _litHtmlServer = require("@popeindustries/lit-html-server");

var _unsafeHtml = require("@popeindustries/lit-html-server/directives/unsafe-html");