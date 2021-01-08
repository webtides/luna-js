"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadStylesheet = void 0;

var _callsite = _interopRequireDefault(require("callsite"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const loadStylesheet = function (path) {
  console.log((0, _callsite.default)().forEach(site => console.log(site.getFileName())));
  console.log(path);
};

exports.loadStylesheet = loadStylesheet;