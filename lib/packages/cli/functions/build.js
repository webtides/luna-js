"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prebuild = exports.build = exports.startDevelopmentBuilds = void 0;

var _config = require("../../framework/config");

var _legacy = require("./legacy");

var rollup = _interopRequireWildcard(require("rollup"));

var _loadConfigFile = _interopRequireDefault(require("rollup/dist/loadConfigFile"));

var _path = _interopRequireDefault(require("path"));

var _componentLoader = require("../../framework/loaders/component-loader");

var _fs = _interopRequireDefault(require("fs"));

var _transformer = require("../build/transformer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const prebuild = async () => {
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

exports.prebuild = prebuild;

const startRollupWatch = async (configFile, callback = () => {}) => {
  const {
    options,
    warnings
  } = await (0, _loadConfigFile.default)(configFile);
  warnings.flush();
  const watcher = rollup.watch(options);
  watcher.on("event", ({
    code,
    result
  }) => {
    switch (code) {
      case "BUNDLE_END":
        result.close();
        return;

      case "START":
        console.log("Compiling client components.");
        break;

      case "END":
        console.log("Client components compiled successfully.");
        callback();
        break;
    }
  });
  console.log("Start watching client components.");
};

const startRollup = async configFile => {
  const {
    options,
    warnings
  } = await (0, _loadConfigFile.default)(configFile);
  warnings.flush();

  for (const option of options) {
    const bundle = await rollup.rollup(option);

    for (const outputOptions of option.output) {
      await bundle.write(option.output[0]);
    }

    await bundle.close();
  }
};

const startDevelopmentBuilds = async () => {
  startRollupWatch(_path.default.join(global.moon.currentDirectory, "rollup.config.client.js"));
};

exports.startDevelopmentBuilds = startDevelopmentBuilds;

const build = async () => {
  const settings = await (0, _config.loadSettings)();

  if (settings.legacyBuild) {
    await (0, _legacy.prepareLegacyBuild)();
  }

  await startRollup(_path.default.join(global.moon.currentDirectory, "rollup.config.client.js"));
};

exports.build = build;