"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("../framework/bootstrap.js");

var _staticSiteGenerator = require("./static-site-generator");

var _componentLoader = require("../framework/loaders/component-loader");

var _default = async () => {
  await (0, _componentLoader.registerAvailableComponents)();
  await (0, _staticSiteGenerator.generateStaticSite)();
};

exports.default = _default;