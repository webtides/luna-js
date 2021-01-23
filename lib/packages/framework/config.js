"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadManifest = exports.loadSettings = exports.getPathToConfigFile = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const loadManifest = async () => {
  const settings = await loadSettings();

  const pathToManifest = _path.default.join(settings.buildDirectory, "generated", "manifest.json");

  if (_fs.default.existsSync(pathToManifest)) {
    return JSON.parse(_fs.default.readFileSync(pathToManifest, {
      encoding: "utf-8"
    }));
  }

  return false;
};

exports.loadManifest = loadManifest;

const getPathToConfigFile = (currentWorkingDirectory = process.cwd()) => {
  return _path.default.join(currentWorkingDirectory, "moon.config.js");
};

exports.getPathToConfigFile = getPathToConfigFile;

const loadSettings = async () => {
  try {
    const settings = (await Promise.resolve(`${getPathToConfigFile()}`).then(s => _interopRequireWildcard(require(s)))).default;
    settings.componentsDirectory = settings.componentsDirectory.map(bundle => {
      bundle._generated = {
        basePath: _path.default.join(settings.buildDirectory, "generated", "components")
      };
      return bundle;
    });
    settings._generated = {
      baseDirectory: _path.default.join(settings.buildDirectory, "generated"),
      applicationDirectory: _path.default.join(settings.buildDirectory, "generated", "application"),
      manifest: _path.default.join(settings.buildDirectory, "generated", "manifest.json")
    };
    return settings;
  } catch (error) {
    console.error(error);
    return false;
  }
};

exports.loadSettings = loadSettings;