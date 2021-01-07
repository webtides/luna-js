"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.build = exports.startDevelopmentBuilds = void 0;

var _config = require("../../framework/config");

var _legacy = require("./legacy");

var _componentLoader = require("../../framework/loaders/component-loader");

const rollup = require("rollup");

const loadConfigFile = require('rollup/dist/loadConfigFile');

const path = require("path");

const fs = require("fs");

const startRollupWatch = async (configFile, callback = () => {}) => {
  const {
    options,
    warnings
  } = await loadConfigFile(configFile);
  warnings.flush();
  const watcher = rollup.watch(options);
  watcher.on("event", ({
    code,
    result
  }) => {
    switch (code) {
      case "BUNDLE_END":
        result.close();
        return;

      case "START":
        console.log("Compiling client components.");
        break;

      case "END":
        console.log("Client components compiled successfully.");
        callback();
        break;
    }
  });
  console.log("Start watching client components.");
};

const startRollup = async configFile => {
  const {
    options,
    warnings
  } = await loadConfigFile(configFile);
  warnings.flush();

  for (const option of options) {
    const bundle = await rollup.rollup(option);

    for (const outputOptions of option.output) {
      await bundle.write(option.output[0]);
    }

    await bundle.close();
  }
};

const startDevelopmentBuilds = async () => {
  startRollupWatch(path.join(global.moon.currentDirectory, "rollup.config.client.js"));
};

exports.startDevelopmentBuilds = startDevelopmentBuilds;

const build = async () => {
  const settings = await (0, _config.loadSettings)();

  if (settings.legacyBuild) {
    await (0, _legacy.prepareLegacyBuild)();
  }

  await startRollup(path.join(global.moon.currentDirectory, "rollup.config.client.js"));
};

exports.build = build;