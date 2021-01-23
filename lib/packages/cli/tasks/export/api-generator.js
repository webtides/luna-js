"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateAPI = void 0;

var _build = require("../build");

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _config = require("../../../framework/config");

var _application = require("../build/application");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const generateApiEntry = async () => {
  var _settings$port, _settings$fallbackApi;

  const settings = await (0, _config.loadSettings)();
  const manifest = await (0, _config.loadManifest)();

  const pathToEntry = _path.default.join(moon.currentDirectory, "build/entries/api.js");

  let entryBlueprint = _fs.default.readFileSync(pathToEntry, {
    encoding: "utf-8"
  });

  const port = (_settings$port = settings.port) !== null && _settings$port !== void 0 ? _settings$port : 3005;
  const fallbackApiRoute = (_settings$fallbackApi = settings.fallbackApiRoute) !== null && _settings$fallbackApi !== void 0 ? _settings$fallbackApi : false;
  entryBlueprint = entryBlueprint.split("__PORT__").join(port);
  entryBlueprint = entryBlueprint.split("__FALLBACK_API_ROUTE__").join(fallbackApiRoute ? `"${fallbackApiRoute}"` : 'false');
  const imports = [];
  let index = 0;

  for (const api of manifest.apis) {
    const {
      basePath,
      relativePath
    } = api;
    const apiRoute = relativePath.split(".js")[0];

    const pathToApiFile = _path.default.posix.join(moon.currentWorkingDirectory, basePath, relativePath).split("\\").join("/");

    imports.push(`
            import * as api${index} from "${pathToApiFile}";
            apisToRegister.push({
                name: "${apiRoute}",
                module: api${index}
            });
        `);
    index++;
  }

  entryBlueprint = entryBlueprint.split("__IMPORTS__").join(imports.join("\r\n"));
  const buildDirectory = settings._generated.baseDirectory;

  if (!_fs.default.existsSync(buildDirectory)) {
    _fs.default.mkdirSync(buildDirectory);
  }

  _fs.default.writeFileSync(_path.default.join(buildDirectory, "entry.apis.js"), entryBlueprint, {
    encoding: "utf-8"
  });
};

const generateAPI = async () => {
  await (0, _application.buildComponentsForApplication)();
  console.log("Generate api entry file.");
  await generateApiEntry();
  console.log("Generate api...");
  await (0, _build.startRollup)(_path.default.join(moon.currentDirectory, "build/configs/rollup.config.api.js"));
};

exports.generateAPI = generateAPI;