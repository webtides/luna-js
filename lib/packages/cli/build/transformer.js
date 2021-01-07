"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformComponents = void 0;

var _config = require("../../framework/config");

var _globAll = _interopRequireDefault(require("glob-all"));

var _path = _interopRequireDefault(require("path"));

var _transformFile = require("@babel/core/lib/transform-file");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const transformComponents = async () => {
  const settings = await (0, _config.loadSettings)();
  const componentsDirectories = settings.componentsDirectory.map(directory => directory.basePath);
  const result = await Promise.all(componentsDirectories.flatMap(directory => {
    const files = _globAll.default.sync(_path.default.join(directory, "**/*.js"));

    return files.map(async file => {
      return (0, _transformFile.transformFileAsync)(file, {
        configFile: require("../../../babel.config")
      });
    });
  }));
  console.log(result);
};

exports.transformComponents = transformComponents;