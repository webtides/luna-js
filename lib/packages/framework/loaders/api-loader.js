"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadApis = void 0;

var _config = require("../config");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const loadApis = async () => {
  const settings = await (0, _config.loadSettings)();
  const manifest = await (0, _config.loadManifest)();
  const basePath = settings._generated.applicationDirectory;
  return manifest.apis.map(({
    file,
    relativePath
  }) => {
    const name = relativePath.split(".js")[0];
    return {
      file: _path.default.join(basePath, file),
      relativePath,
      name
    };
  });
};

exports.loadApis = loadApis;