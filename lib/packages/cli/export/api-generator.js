"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateAPI = void 0;

var _build = require("../tasks/build");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const generateAPI = async () => {
  await (0, _build.startRollup)(_path.default.join(moon.currentDirectory, "build/configs/rollup.config.api.js"));
};

exports.generateAPI = generateAPI;