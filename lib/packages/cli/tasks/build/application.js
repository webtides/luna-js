"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startApplicationDevelopmentBuild = exports.buildComponentsForApplication = void 0;

var _build = require("../build");

var _path = _interopRequireDefault(require("path"));

var _legacy = require("../legacy");

var _config = require("../../../framework/config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const buildComponentsForApplication = async () => {
  const settings = await (0, _config.loadSettings)();
  await (0, _build.startRollup)(_path.default.join(moon.currentDirectory, "build/configs/rollup.config.application.js"));

  if (settings.legacyBuild) {
    await (0, _legacy.prepareLegacyBuild)();
  }

  await (0, _build.startRollup)(_path.default.join(moon.currentDirectory, "build/configs/rollup.config.client.legacy.js"));
};

exports.buildComponentsForApplication = buildComponentsForApplication;

const startApplicationDevelopmentBuild = async (callback = () => {}) => {
  const settings = await (0, _config.loadSettings)();
  (0, _build.startRollupWatch)(_path.default.join(global.moon.currentDirectory, "build/configs", "rollup.config.application.js"), callback);
};

exports.startApplicationDevelopmentBuild = startApplicationDevelopmentBuild;