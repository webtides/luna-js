"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkRequirements = void 0;

var _config = require("../../framework/config");

var _fs = _interopRequireDefault(require("fs"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const copyEmptyMoonConfig = async () => {
  _fs.default.copyFileSync(_path.default.join(moon.currentDirectory, "moon.config.example.js"), (0, _config.getPathToConfigFile)(moon.currentWorkingDirectory));

  const settings = await (0, _config.loadSettings)();
  settings.pagesDirectory.forEach(page => _fs.default.mkdirSync(page));
  settings.hooksDirectory.forEach(hook => _fs.default.mkdirSync(hook));
  settings.apiDirectory.forEach(api => _fs.default.mkdirSync(api));
  settings.componentsDirectory.forEach(component => _fs.default.mkdirSync(component.basePath));
};

const checkRequirements = async () => {
  const pathToConfigFile = (0, _config.getPathToConfigFile)(moon.currentWorkingDirectory);

  if (!_fs.default.existsSync(pathToConfigFile)) {
    console.log("We couldn't detect a moon.config.js in your application directory.");
    const questions = [{
      type: "confirm",
      default: false,
      name: "createConfig",
      describe: "Would you like to create a config file?"
    }];
    const result = await _inquirer.default.prompt(questions);

    if (result.createConfig) {
      await copyEmptyMoonConfig();
      return true;
    }

    return false;
  }

  return true;
};

exports.checkRequirements = checkRequirements;