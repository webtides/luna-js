"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = void 0;

require("../framework/bootstrap");

var _build = require("./tasks/build");

var _watcher = require("./tasks/watcher");

var _prepare = require("./tasks/prepare");

var _docker = require("./tasks/docker");

var _server = require("./tasks/build/server");

const startMoonJS = async () => {
  require("../framework").startServer();
};

const execute = async argv => {
  const meetsRequirements = await (0, _prepare.checkRequirements)();

  if (!meetsRequirements) {
    return;
  }

  if (argv.dev) {
    console.log("Starting moon in development mode.");
    (0, _build.startDevelopmentBuilds)();
    startMoonJS();
    (0, _watcher.startWatchingPagesDirectories)();
    (0, _watcher.startWatchingComponentDirectories)();
    return;
  }

  if (argv.build) {
    await (0, _build.build)();
    return;
  }

  if (argv.start) {
    startMoonJS();
    return;
  }

  if (argv.dockerfile) {
    (0, _docker.publishDockerFile)();
    return;
  } // Default


  await (0, _server.buildComponentsForServer)();
  await (0, _build.build)();
  startMoonJS();
};

exports.execute = execute;