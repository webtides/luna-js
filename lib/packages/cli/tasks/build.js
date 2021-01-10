"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startRollupWatch = exports.startRollup = void 0;

var rollup = _interopRequireWildcard(require("rollup"));

var _loadConfigFile = _interopRequireDefault(require("rollup/dist/loadConfigFile"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
        break;

      case "END":
        callback();
        break;
    }
  });
};

exports.startRollupWatch = startRollupWatch;

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

exports.startRollup = startRollup;