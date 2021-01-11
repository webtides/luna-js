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
  const manifest = await (0, _config.loadManifest)();
  const basePath = settings._generated.applicationDirectory;

  for (const component of manifest.components) {
    var _element$prototype;

    const {
      file,
      relativePath,
      settings,
      children
    } = component;

    const absolutePath = _path.default.join(basePath, file);

    const element = require(_path.default.resolve(absolutePath));

    if (typeof (element === null || element === void 0 ? void 0 : (_element$prototype = element.prototype) === null || _element$prototype === void 0 ? void 0 : _element$prototype.connectedCallback) === "undefined") {
      return;
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
    console.log("Register component", tagName);
    allAvailableComponents[tagName] = {
      element,
      tagName,
      hasStaticProperties,
      hasDynamicProperties,
      name: element.name,
      file,
      relativePath,
      outputDirectory: settings.outputDirectory,
      children
    };
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