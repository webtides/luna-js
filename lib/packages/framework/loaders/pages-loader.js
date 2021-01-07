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
  var _page$default$prototy;

  const page = require(_path.default.resolve(file));

  const availableMethods = [];

  if (typeof ((_page$default$prototy = page.default.prototype) === null || _page$default$prototy === void 0 ? void 0 : _page$default$prototy.connectedCallback) === "undefined") {
    if (typeof page.post === "function") {
      availableMethods.push("post");
    }
  } else {
    const element = new page.default();

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
  var _page$default, _page$default$prototy2;

  const settings = await (0, _config.loadSettings)();
  let markup = "";
  let layoutFactory = _base.default;
  let element;

  if (typeof (page === null || page === void 0 ? void 0 : (_page$default = page.default) === null || _page$default === void 0 ? void 0 : (_page$default$prototy2 = _page$default.prototype) === null || _page$default$prototy2 === void 0 ? void 0 : _page$default$prototy2.connectedCallback) === "undefined") {
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
      element: page.default
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
  return settings.pagesDirectory.flatMap(basePath => {
    console.log("Load pages in", basePath);

    const files = _glob.default.sync(_path.default.join(basePath, `**/*.js`));

    const pages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = file.substring(basePath.length);
      const name = relativePath.split(".js")[0];
      pages.push({
        file,
        name,
        relativePath
      });
    }

    return pages;
  });
};

exports.loadPages = loadPages;