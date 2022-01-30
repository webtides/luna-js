global.previousWorkingDirectory = process.cwd();

global.getCurrentWorkingDirectory = fixture => {
    return global.previousWorkingDirectory + "/test/fixtures/" + fixture;
};

require("./tests/unit/services/service-container.js");

require("./tests/unit/renderers/base.js");
require("./tests/unit/renderers/element-js-vanilla.js");
require("./tests/unit/renderers/lit.js");

require("./tests/basic.js");
require("./tests/empty.js");
