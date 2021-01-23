"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerApiRoute = void 0;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const registerApiRoute = async (router, {
  file,
  name
}) => {
  const module = require(_path.default.resolve(file));

  const get = module.get || module;
  const post = module.post;
  get && router.get(`/api${name}`, (request, response) => {
    try {
      return get({
        request,
        response
      });
    } catch (error) {
      return response.status(500);
    }
  });
  post && router.post(`/api${name}`, (request, response) => {
    try {
      return post({
        request,
        response
      });
    } catch (error) {
      return response.status(500);
    }
  });
  console.log("Registered api routes for", name);
};

exports.registerApiRoute = registerApiRoute;