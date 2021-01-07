"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareForDocker = exports.publishDockerFile = void 0;

var _componentLoader = require("../../framework/loaders/component-loader");

var _config = require("../../framework/config");

const exec = require('child_process').exec;

const path = require("path");

const fs = require("fs");

const prepareForDocker = async () => {
  const settings = await (0, _config.loadSettings)();
  const availableComponents = await (0, _componentLoader.registerAvailableComponents)({
    generateCssBundles: true
  });
  const generatedDirectory = path.join(settings.buildDirectory, "generated");

  if (!fs.existsSync(generatedDirectory)) {
    fs.mkdirSync(generatedDirectory);
  }

  const manifest = {
    availableComponents
  };
  fs.writeFileSync(path.join(generatedDirectory, "manifest.json"), JSON.stringify(manifest), {
    encoding: "utf-8"
  });
};

exports.prepareForDocker = prepareForDocker;

const publishDockerFile = async () => {
  fs.copyFileSync(path.resolve(moon.currentDirectory, "packages/cli/docker/Dockerfile"), path.join(moon.currentWorkingDirectory, "Dockerfile"));
  fs.copyFileSync(path.resolve(moon.currentDirectory, "packages/cli/docker/.dockerignore"), path.join(moon.currentWorkingDirectory, ".dockerignore"));
};

exports.publishDockerFile = publishDockerFile;