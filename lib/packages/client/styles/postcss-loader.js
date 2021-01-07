"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformCssModules = exports.setPostcssModule = exports.postcssPlugins = void 0;

var _path = _interopRequireDefault(require("path"));

var _postcss = _interopRequireDefault(require("postcss"));

var _fs = _interopRequireDefault(require("fs"));

var _postcssImport = _interopRequireDefault(require("postcss-import"));

var _postcssPresetEnv = _interopRequireDefault(require("postcss-preset-env"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The loaded styles, grouped by their modulePath.
 * @type {{}}
 */
const loadedStyles = {};
const postcssSettings = {};

require.extensions['.css'] = (module, filename) => {
  module.exports = "";
};

const requireExtension = currentModulePath => {
  return (module, filename) => {
    const css = _fs.default.readFileSync(filename, 'utf8');

    if (currentModulePath) {
      loadedStyles[currentModulePath] ? loadedStyles[currentModulePath].push(css) : loadedStyles[currentModulePath] = [css];
      module.exports = "";
      return;
    }

    module.exports = css;
  };
};

const postcssPlugins = [_postcssImport.default, (0, _postcssPresetEnv.default)({
  stage: 1
})];
exports.postcssPlugins = postcssPlugins;

const transformCssModules = async () => {
  Object.keys(loadedStyles).map(async basePath => {
    const styles = loadedStyles[basePath];
    const settings = postcssSettings[basePath];
    const css = styles.join("\r\n");
    const result = await (0, _postcss.default)([...postcssPlugins, ...settings.postcssPlugins]).process(css);
    const {
      outputDirectory,
      filename
    } = settings;

    if (!_fs.default.existsSync(outputDirectory)) {
      _fs.default.mkdirSync(outputDirectory, {
        recursive: true
      });
    }

    _fs.default.writeFileSync(_path.default.join(outputDirectory, filename), result.css, {
      encoding: "utf-8"
    });
  });
};

exports.transformCssModules = transformCssModules;

const setPostcssModule = (modulePath, settings) => {
  postcssSettings[modulePath] = settings;
  require.extensions['.css'] = requireExtension(modulePath);
};

exports.setPostcssModule = setPostcssModule;