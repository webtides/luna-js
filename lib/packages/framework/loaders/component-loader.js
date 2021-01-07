"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAvailableComponents = exports.registerAvailableComponents = exports.loadSingleComponentByTagName = void 0;

var _glob = _interopRequireDefault(require("glob"));

var _config = _interopRequireWildcard(require("../config.js"));

var _path = _interopRequireDefault(require("path"));

var _postcssLoader = require("../../client/styles/postcss-loader");

var _paramCase = require("param-case");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
  const bundles = settings.componentsDirectory.map(({
    basePath,
    styles,
    outputDirectory
  }) => {
    return {
      files: _glob.default.sync(`${basePath}/**/*.js`),
      basePath,
      styles,
      outputDirectory
    };
  });

  for (const bundle of bundles) {
    const {
      files,
      basePath,
      styles,
      outputDirectory
    } = bundle;

    if (generateCssBundles) {
      // Set the current module to let the css parser know which postcss settings to apply.
      (0, _postcssLoader.setPostcssModule)(basePath, styles);
    }

    for (let i = 0; i < files.length; i++) {
      var _element$prototype;

      const file = files[i]; // By importing the module here, we are also loading the css for the module.

      const module = require(_path.default.resolve(file));

      const relativePath = file.substring(basePath.length);
      const element = module.default;

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
      console.log(tagName);
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

  if (generateCssBundles) {
    await (0, _postcssLoader.transformCssModules)();
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