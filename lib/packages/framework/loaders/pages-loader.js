"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadPageMetaData = exports.loadSinglePage = exports.loadPages = void 0;

var _path = _interopRequireDefault(require("path"));

var _config = require("../config.js");

var _litHtmlServer = require("@popeindustries/lit-html-server");

var _glob = _interopRequireDefault(require("glob"));

var _base = _interopRequireDefault(require("../../client/layouts/base.js"));

var _elementRenderer = require("../engine/element-renderer");

var _unsafeHtml = require("@popeindustries/lit-html-server/directives/unsafe-html");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getLayout = async (factory, {
  context
}) => {
  return (0, _litHtmlServer.renderToString)(factory({
    html: _litHtmlServer.html,
    context
  }));
};

const loadPageMetaData = async ({
  file
}) => {
  var _pageElement$prototyp;

  const page = require(_path.default.resolve(file));

  const pageElement = typeof (page === null || page === void 0 ? void 0 : page.default) === "undefined" ? page : page.default;
  const availableMethods = [];

  if (typeof ((_pageElement$prototyp = pageElement.prototype) === null || _pageElement$prototyp === void 0 ? void 0 : _pageElement$prototyp.connectedCallback) === "undefined") {
    if (typeof page.post === "function") {
      availableMethods.push("post");
    }
  } else {
    const element = new pageElement();

    if (typeof element.post === "function") {
      availableMethods.push("post");
    }
  }

  return {
    availableMethods,
    page
  };
};

exports.loadPageMetaData = loadPageMetaData;

const loadSinglePage = async ({
  page,
  request,
  response
}) => {
  var _pageElement$prototyp2;

  const settings = await (0, _config.loadSettings)();
  let markup = "";
  let layoutFactory = _base.default;
  const pageElement = typeof (page === null || page === void 0 ? void 0 : page.default) === "undefined" ? page : page.default;
  let element;

  if (typeof (pageElement === null || pageElement === void 0 ? void 0 : (_pageElement$prototyp2 = pageElement.prototype) === null || _pageElement$prototyp2 === void 0 ? void 0 : _pageElement$prototyp2.connectedCallback) === "undefined") {
    markup = await (0, _litHtmlServer.renderToString)(page.default({
      html: _litHtmlServer.html,
      request,
      response
    }));

    if (page.layout) {
      const layoutModule = page.layout;
      layoutFactory = typeof layoutModule === "function" ? layoutModule : layoutModule.default;
    }

    element = page;
  } else {
    // We are dealing with a custom element here.
    const component = {
      element: pageElement
    };
    const result = await (0, _elementRenderer.renderComponent)({
      component,
      attributes: {},
      request,
      response
    });
    markup = result.markup;
    element = result.element;

    if (result.element.layout) {
      const layoutModule = result.element.layout;
      layoutFactory = layoutModule.default;
    }
  }

  const pageHTML = await getLayout(layoutFactory, {
    context: {
      page: (0, _litHtmlServer.html)`${(0, _unsafeHtml.unsafeHTML)(markup)}`
    }
  });
  return {
    html: pageHTML,
    element
  };
};

exports.loadSinglePage = loadSinglePage;

const loadPages = async () => {
  const settings = await (0, _config.loadSettings)();
  const manifest = await (0, _config.loadManifest)();
  const basePath = settings._generated.pagesDirectory;
  return manifest.pages.map(page => {
    const {
      relativePath,
      file
    } = page;
    const name = relativePath.split(".js")[0];
    return {
      file: _path.default.join(basePath, file),
      relativePath,
      name
    };
  });
};

exports.loadPages = loadPages;