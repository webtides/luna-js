global.previousWorkingDirectory = process.cwd();

global.getCurrentWorkingDirectory = fixture => {
    return global.previousWorkingDirectory + "/test/fixtures/" + fixture;
};

require("./tests/unit/services/service-container.js");

require("./tests/unit/renderers/base.js");
require("./tests/unit/renderers/element-js.js");
require("./tests/unit/renderers/element-js-vanilla.js");

// In the test environment, the lit server renderer is not compatible with luna
// This is a good case to finally refactor luna.js to not use any globals.
// TODO:

// require("./tests/unit/renderers/lit.js");

require("./tests/basic.js");
require("./tests/empty.js");
