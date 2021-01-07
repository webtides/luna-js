"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.publishDockerFile = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const publishDockerFile = async () => {
  _fs.default.copyFileSync(_path.default.resolve(moon.currentDirectory, "packages/cli/docker/Dockerfile"), _path.default.join(moon.currentWorkingDirectory, "Dockerfile"));

  _fs.default.copyFileSync(_path.default.resolve(moon.currentDirectory, "packages/cli/docker/.dockerignore"), _path.default.join(moon.currentWorkingDirectory, ".dockerignore"));
};

exports.publishDockerFile = publishDockerFile;