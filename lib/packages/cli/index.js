"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = void 0;

require("../framework/bootstrap");

var _prepare = require("./tasks/prepare");

var _docker = require("./tasks/docker");

var _application = require("./tasks/build/application");

var _cache = require("../framework/cache/cache");

var _framework = require("../framework");

var _export = _interopRequireDefault(require("../export"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let moonJSStarting = false;

const startMoonJS = async () => {
  if (moonJSStarting) return;
  moonJSStarting = true;
  await (0, _framework.restartServer)();
  moonJSStarting = false;
};

const execute = async argv => {
  const meetsRequirements = await (0, _prepare.checkRequirements)();

  if (!meetsRequirements) {
    return;
  }

  if (argv.dev) {
    console.log("Starting moon in development mode.");
    (0, _application.startApplicationDevelopmentBuild)(() => {
      (0, _cache.clearCache)();
      startMoonJS();
    });
    return;
  }

  if (argv.build) {
    await (0, _application.buildComponentsForApplication)();
    return;
  }

  if (argv.start) {
    startMoonJS();
    return;
  }

  if (argv.dockerfile) {
    (0, _docker.publishDockerFile)();
    return;
  }

  if (argv.export) {
    (0, _export.default)();
    return;
  } // Default


  await (0, _application.buildComponentsForApplication)(); // await buildComponentsForClient();

  startMoonJS();
};

exports.execute = execute;