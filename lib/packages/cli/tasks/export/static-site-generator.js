"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateStaticSite = void 0;

var _pagesLoader = require("../../../framework/loaders/pages-loader.js");

var _documentRenderer = _interopRequireDefault(require("../../../framework/engine/document-renderer.js"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _glob = _interopRequireDefault(require("glob"));

var _config = _interopRequireWildcard(require("../../../framework/config"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const generateStaticSite = async () => {
  const settings = await (0, _config.loadSettings)();
  const outputDirectory = settings.export.outputDirectory;
  const pages = await (0, _pagesLoader.loadPages)();
  await Promise.all(pages.map(async ({
    file,
    name,
    relativePath
  }) => {
    const {
      page
    } = await (0, _pagesLoader.loadPageMetaData)({
      file
    });
    const {
      html
    } = await (0, _pagesLoader.loadSinglePage)({
      page,
      request: false,
      response: false
    });
    const renderedPage = await (0, _documentRenderer.default)(html, {
      request: false,
      response: false
    });

    let pageDirectory = _path.default.join(outputDirectory, name);

    if (pageDirectory.endsWith("index")) {
      pageDirectory = _path.default.join(pageDirectory, "..");
    }

    _fs.default.mkdirSync(pageDirectory, {
      recursive: true
    });

    _fs.default.writeFileSync(_path.default.join(pageDirectory, "index.html"), renderedPage, {
      encoding: "UTF-8"
    });

    await Promise.all(_glob.default.sync(_path.default.join(settings.publicDirectory, "**/*")).map(file => {
      if (_fs.default.lstatSync(file).isDirectory()) {
        return;
      }

      const relativePath = file.substring(settings.publicDirectory.length);

      const publicAssetDirectory = _path.default.dirname(_path.default.join(outputDirectory, relativePath));

      _fs.default.mkdirSync(publicAssetDirectory, {
        recursive: true
      });

      _fs.default.copyFileSync(file, _path.default.join(outputDirectory, relativePath));
    }));
  }));
};

exports.generateStaticSite = generateStaticSite;