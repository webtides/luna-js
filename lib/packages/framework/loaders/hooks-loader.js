"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadHooks = void 0;

var _config = _interopRequireWildcard(require("../config"));

var _glob = _interopRequireDefault(require("glob"));

var _path = _interopRequireDefault(require("path"));

var _hooks = require("../hooks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const loadHooks = async () => {
  const settings = await (0, _config.loadSettings)();
  const fileGroups = settings.hooksDirectory.map(hooksDirectory => {
    return {
      files: _glob.default.sync(`${hooksDirectory}/**/*.js`),
      basePath: hooksDirectory
    };
  });
  await Promise.all(fileGroups.map(async ({
    files,
    basePath
  }) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const module = await Promise.resolve(`${_path.default.resolve(file)}`).then(s => _interopRequireWildcard(require(s)));
      (0, _hooks.registerHook)(module.name, module.default);
    }
  }));
};

exports.loadHooks = loadHooks;