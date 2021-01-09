"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processCss = void 0;

var _path = _interopRequireDefault(require("path"));

var _postcss = _interopRequireDefault(require("postcss"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The loaded styles, grouped by their modulePath.
 * @type {{}}
 */
const loadedStyles = {};
const postcssSettings = {};

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

const postcssPlugins = [require("postcss-import"), require("postcss-preset-env")({
  stage: 1
})];

const processCss = ({
  css,
  plugins
}) => {
  return (0, _postcss.default)([...postcssPlugins, ...plugins]).process(css);
};

exports.processCss = processCss;

const transformCssModules = async () => {
  Object.keys(loadedStyles).map(async basePath => {
    const styles = loadedStyles[basePath];
    const settings = postcssSettings[basePath];
    const css = styles.join("\r\n");
    const result = await processCss({
      css,
      plugins: settings.postcssPlugins
    });
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