"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAvailableComponents = exports.registerAvailableComponents = exports.loadSingleComponentByTagName = void 0;

var _glob = _interopRequireDefault(require("glob"));

var _config = require("../config.js");

var _path = _interopRequireDefault(require("path"));

var _paramCase = require("param-case");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let allAvailableComponents = {};

const isDynamicElement = element => {
  const instance = new element();
  const availableProperties = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
  return availableProperties.includes("loadDynamicProperties");
};

const registerAvailableComponents = async ({
  generateCssBundles = true
} = {}) => {
  allAvailableComponents = {};
  const settings = await (0, _config.loadSettings)();
  const bundles = settings.componentsDirectory.map(bundle => {
    const {
      basePath
    } = bundle._generated;
    const {
      outputDirectory
    } = bundle;
    return {
      files: _glob.default.sync(`${basePath}/**/*.js`),
      basePath,
      outputDirectory
    };
  });

  for (const bundle of bundles) {
    const {
      files,
      basePath,
      outputDirectory
    } = bundle;
    console.log(files);

    for (let i = 0; i < files.length; i++) {
      var _element$prototype;

      const file = files[i];

      const element = require(_path.default.resolve(file));

      const relativePath = file.substring(basePath.length);

      if (typeof (element === null || element === void 0 ? void 0 : (_element$prototype = element.prototype) === null || _element$prototype === void 0 ? void 0 : _element$prototype.connectedCallback) === "undefined") {
        continue;
      }

      let hasStaticProperties = false;

      if (!element.disableSSR && typeof element.loadStaticProperties === "function") {
        const staticProperties = await element.loadStaticProperties();

        if (staticProperties) {
          hasStaticProperties = true;
          element.staticProperties = staticProperties;
        }
      }

      const hasDynamicProperties = isDynamicElement(element);
      const tagName = (0, _paramCase.paramCase)(element.name);
      allAvailableComponents[tagName] = {
        element,
        tagName,
        hasStaticProperties,
        hasDynamicProperties,
        name: element.name,
        file,
        relativePath,
        outputDirectory
      };
    }
  }

  return allAvailableComponents;
};

exports.registerAvailableComponents = registerAvailableComponents;

const getAvailableComponents = () => allAvailableComponents;

exports.getAvailableComponents = getAvailableComponents;

const loadSingleComponentByTagName = async tagName => {
  const components = getAvailableComponents();

  if (components[tagName]) {
    return components[tagName];
  }

  return false;
};

exports.loadSingleComponentByTagName = loadSingleComponentByTagName;