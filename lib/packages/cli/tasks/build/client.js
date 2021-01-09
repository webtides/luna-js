"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildComponentsForClient = exports.startClientDevelopmentBuild = void 0;

var _path = _interopRequireDefault(require("path"));

var _config = require("../../../framework/config");

var _legacy = require("../legacy");

var _build = require("../build");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const startClientDevelopmentBuild = () => {
  (0, _build.startRollupWatch)(_path.default.join(global.moon.currentDirectory, "build/configs", "rollup.config.client.js"));
};

exports.startClientDevelopmentBuild = startClientDevelopmentBuild;

const buildComponentsForClient = async () => {
  const settings = await (0, _config.loadSettings)();

  if (settings.legacyBuild) {
    await (0, _legacy.prepareLegacyBuild)();
  }

  await (0, _build.startRollup)(_path.default.join(global.moon.currentDirectory, "build/configs", "rollup.config.client.js"));
};

exports.buildComponentsForClient = buildComponentsForClient;