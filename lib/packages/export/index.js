"use strict";

require("../framework/bootstrap.js");

var _staticSiteGenerator = require("./static-site-generator");

var _componentLoader = require("../framework/loaders/component-loader");

(async () => {
  await (0, _componentLoader.registerAvailableComponents)();
  await (0, _staticSiteGenerator.generateStaticSite)();
})();