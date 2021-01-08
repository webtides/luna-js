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

  const generateEntryFile = () => {
    let contents = `
            // TODO: use core-js in near future
            Object.defineProperty(Array.prototype, "includes", {
                value: function(searchElement, fromIndex) {
                    return this.indexOf(searchElement) !== -1;
                }
            });
        `;
    settings.componentsDirectory.map(bundle => {
      const elements = _glob.default.sync(_path.default.join(bundle.basePath, "**/*.js"));

      const relativePath = bundle.outputDirectory.substring(settings.publicDirectory.length);
      contents += elements.map(element => {
        const elementName = element.split("/").pop().split(".js")[0];
        const className = (0, _pascalCase.pascalCase)(elementName);
        return `
                   import ${className} from "${relativePath}/${elementName}.js";
                   customElements.define("${elementName}", ${className});
               `;
      }).join("\n\r");
    });

    const buildDirectory = _path.default.join(settings.buildDirectory, "generated");

    if (!_fs.default.existsSync(buildDirectory)) {
      _fs.default.mkdirSync(buildDirectory);
    }

    _fs.default.writeFileSync(_path.default.join(buildDirectory, "entry.legacy.js"), contents, {
      encoding: "utf-8"
    });
  };

  generateEntryFile();
};

exports.prepareLegacyBuild = prepareLegacyBuild;