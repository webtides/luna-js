"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startWatchingPagesDirectories = exports.startWatchingComponentDirectories = void 0;

var _config = require("../../framework/config");

var _chokidar = _interopRequireDefault(require("chokidar"));

var _componentLoader = require("../../framework/loaders/component-loader");

var _cache = require("../../framework/cache/cache");

var _framework = require("../../framework");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const watchers = {};

const startWatchingComponentDirectories = async () => {
  console.log("Start watching component directories");
  const settings = await (0, _config.loadSettings)();
  const componentBundles = settings.componentsDirectory;
  const directoriesToWatch = componentBundles.map(bundle => bundle.basePath);
  startWatchingDirectories("components", directoriesToWatch, path => {
    (0, _componentLoader.registerAvailableComponents)();
  });
};

exports.startWatchingComponentDirectories = startWatchingComponentDirectories;

const startWatchingPagesDirectories = async () => {
  console.log("Start watching pages directories");
  const settings = await (0, _config.loadSettings)();
  const directoriesToWatch = settings.pagesDirectory;
  startWatchingDirectories("pages", directoriesToWatch, path => {
    (0, _cache.clearCache)();
    (0, _framework.restartServer)();
  });
};

exports.startWatchingPagesDirectories = startWatchingPagesDirectories;

const startWatchingDirectories = (name, directories, callback) => {
  if (watchers[name]) {
    return;
  }

  const watcher = _chokidar.default.watch(directories, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: true,
    interval: 200
  });

  watchers[name] = watcher;

  const watcherCallback = path => {
    delete require.cache[require.resolve(path)];
    callback(path);
  };

  watcher.on('change', path => {
    watcherCallback(path);
    console.log(`File ${path} has been changed.`);
  }).on('add', path => {
    watcherCallback(path);
    console.log(`File ${path} has been added.`);
  }).on('unlink', path => {
    watcherCallback(path);
    console.log(`File ${path} has been removed.`);
  });
};