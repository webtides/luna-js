"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareForDocker = exports.publishDockerFile = void 0;

var _componentLoader = require("../../framework/loaders/component-loader");

var _config = require("../../framework/config");

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const prepareForDocker = async () => {
  const settings = await (0, _config.loadSettings)();
  const availableComponents = await (0, _componentLoader.registerAvailableComponents)({
    generateCssBundles: true
  });

  const generatedDirectory = _path.default.join(settings.buildDirectory, "generated");

  if (!_fs.default.existsSync(generatedDirectory)) {
    _fs.default.mkdirSync(generatedDirectory);
  }

  const manifest = {
    availableComponents
  };

  _fs.default.writeFileSync(_path.default.join(generatedDirectory, "manifest.json"), JSON.stringify(manifest), {
    encoding: "utf-8"
  });
};

exports.prepareForDocker = prepareForDocker;

const publishDockerFile = async () => {
  _fs.default.copyFileSync(_path.default.resolve(moon.currentDirectory, "packages/cli/docker/Dockerfile"), _path.default.join(moon.currentWorkingDirectory, "Dockerfile"));

  _fs.default.copyFileSync(_path.default.resolve(moon.currentDirectory, "packages/cli/docker/.dockerignore"), _path.default.join(moon.currentWorkingDirectory, ".dockerignore"));
};

exports.publishDockerFile = publishDockerFile;