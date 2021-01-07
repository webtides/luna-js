"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.build = exports.startDevelopmentBuilds = void 0;

var _config = require("../../framework/config");

var _legacy = require("./legacy");

var _rollup = _interopRequireDefault(require("rollup"));

var _loadConfigFile = _interopRequireDefault(require("rollup/dist/loadConfigFile"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const startRollupWatch = async (configFile, callback = () => {}) => {
  const {
    options,
    warnings
  } = await (0, _loadConfigFile.default)(configFile);
  warnings.flush();

  const watcher = _rollup.default.watch(options);

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
    const bundle = await _rollup.default.rollup(option);

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