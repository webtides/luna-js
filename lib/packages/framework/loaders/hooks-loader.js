"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadHooks = void 0;

var _config = require("../config");

var _path = _interopRequireDefault(require("path"));

var _hooks = require("../hooks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const loadHooks = async () => {
  const settings = await (0, _config.loadSettings)();
  const manifest = await (0, _config.loadManifest)();
  const basePath = settings._generated.applicationDirectory;
  manifest.hooks.forEach(({
    file,
    relativePath
  }) => {
    const module = require(_path.default.resolve(_path.default.join(basePath, file)));

    (0, _hooks.registerHook)(module.name, module.default);
  });
};

exports.loadHooks = loadHooks;