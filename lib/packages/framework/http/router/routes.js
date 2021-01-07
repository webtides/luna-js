"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.currentRouter = exports.routes = void 0;

var _pagesLoader = require("../../loaders/pages-loader.js");

var _documentRenderer = _interopRequireDefault(require("../../engine/document-renderer.js"));

var _apiLoader = require("../../loaders/api-loader");

var _path = _interopRequireDefault(require("path"));

var _config = require("../../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

let currentRouter;
exports.currentRouter = currentRouter;

const getRouteName = name => {
  name = name.replace(/\[(.*)]/, ":$1");

  if (name.endsWith("/index")) {
    return name.substring(0, name.length - "/index".length);
  }

  return name;
};

const isRouteWithParam = name => {
  const regex = new RegExp(/\[(.*)]/);
  return regex.test(name);
};

const routes = async ({
  router
}) => {
  var _settings$fallbackRou, _settings$fallbackApi;

  exports.currentRouter = currentRouter = router;
  const pages = await (0, _pagesLoader.loadPages)();
  const settings = await (0, _config.loadSettings)();
  const fallbackRoute = (_settings$fallbackRou = settings.fallbackRoute) !== null && _settings$fallbackRou !== void 0 ? _settings$fallbackRou : false;
  const fallbackApiRoute = (_settings$fallbackApi = settings.fallbackApiRoute) !== null && _settings$fallbackApi !== void 0 ? _settings$fallbackApi : false;
  let fallbackPage = false,
      fallbackApi = false;

  const registerPageRoute = async ({
    file,
    name
  }) => {
    const route = getRouteName(name);
    const {
      page
    } = await (0, _pagesLoader.loadPageMetaData)({
      file
    });
    router.get(route, async (request, response) => {
      console.log("Calling", route, request.path);
      const {
        html
      } = await (0, _pagesLoader.loadSinglePage)({
        page,
        request,
        response
      });
      return response.send(await (0, _documentRenderer.default)(html, {
        request,
        response
      }));
    });
    router.post(route, async (request, response) => {
      const {
        html
      } = await (0, _pagesLoader.loadSinglePage)({
        page,
        method: "post",
        request,
        response
      });
      return response.send(await (0, _documentRenderer.default)(html, {
        request,
        response
      }));
    });
    console.log(`Registered route ${route}.`);
  };

  const registerApiRoute = async ({
    file,
    name
  }) => {
    const module = await Promise.resolve(`${_path.default.resolve(file)}`).then(s => _interopRequireWildcard(require(s)));
    const get = module.get || module.default;
    const post = module.post;
    get && router.get(`/api${name}`, (request, response) => {
      return get({
        request,
        response
      });
    });
    post && router.post(`/api${name}`, (request, response) => {
      return post({
        request,
        response
      });
    });
    console.log("Registered api routes for", name);
  };

  const sortedPages = pages.sort((a, b) => {
    if (isRouteWithParam(a.name) && !isRouteWithParam(b.name)) {
      return 1;
    } else if (isRouteWithParam(b.name) && !isRouteWithParam(a.name)) {
      return -1;
    }

    return 0;
  });

  for (let i = 0; i < sortedPages.length; i++) {
    const page = sortedPages[i];

    if (page.name === fallbackRoute) {
      fallbackPage = page;
      continue;
    }

    await registerPageRoute(page);
  }

  const apis = await (0, _apiLoader.loadApis)();
  apis.map(async ({
    file,
    name,
    relativePath
  }) => {
    if (name === fallbackApiRoute) {
      fallbackApi = {
        file,
        name
      };
      return;
    }

    await registerApiRoute({
      file,
      name
    });
  });

  if (fallbackApi) {
    await registerApiRoute({
      file: fallbackApi.file,
      name: "/*"
    });
  }

  if (fallbackPage) {
    await registerPageRoute({
      file: fallbackPage.file,
      name: "*"
    });
  }
};

exports.routes = routes;