"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareLegacyBuild = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _glob = _interopRequireDefault(require("glob"));

var _config = require("../../framework/config");

var _pascalCase = require("pascal-case");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const prepareLegacyBuild = async () => {
  console.log("Generate entry file");
  const settings = await (0, _config.loadSettings)();

  const generateEntryFile = async () => {
    let contents = `
            // TODO: use core-js in near future
            Object.defineProperty(Array.prototype, "includes", {
                value: function(searchElement, fromIndex) {
                    return this.indexOf(searchElement) !== -1;
                }
            });
        `;
    const manifest = await (0, _config.loadManifest)();
    let code = [];

    for (const component of manifest.components) {
      const {
        basePath,
        relativePath
      } = component;
      const elementName = relativePath.split("/").pop().split(".js")[0];
      const className = (0, _pascalCase.pascalCase)(elementName);
      code.push(`
               import ${className} from "../..${basePath}${relativePath}";
               customElements.define("${elementName}", ${className});
           `);
    }

    contents += code.join("\r\n");
    const buildDirectory = settings._generated.baseDirectory;

    if (!_fs.default.existsSync(buildDirectory)) {
      _fs.default.mkdirSync(buildDirectory);
    }

    _fs.default.writeFileSync(_path.default.join(buildDirectory, "entry.legacy.js"), contents, {
      encoding: "utf-8"
    });
  };

  await generateEntryFile();
};

exports.prepareLegacyBuild = prepareLegacyBuild;