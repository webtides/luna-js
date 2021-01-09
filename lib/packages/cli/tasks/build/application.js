"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startApplicationDevelopmentBuild = exports.buildComponentsForApplication = void 0;

var _build = require("../build");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const buildComponentsForApplication = async () => {
  await (0, _build.startRollup)(_path.default.join(moon.currentDirectory, "build/configs/rollup.config.application.js"));
};

exports.buildComponentsForApplication = buildComponentsForApplication;

const startApplicationDevelopmentBuild = (callback = () => {}) => {
  (0, _build.startRollupWatch)(_path.default.join(global.moon.currentDirectory, "build/configs", "rollup.config.application.js"), callback);
};

exports.startApplicationDevelopmentBuild = startApplicationDevelopmentBuild;