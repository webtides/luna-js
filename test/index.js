global.previousWorkingDirectory = process.cwd();

global.getCurrentWorkingDirectory = fixture => {
    return global.previousWorkingDirectory + "/test/fixtures/" + fixture;
};

require("./tests/basic.js");
require("./tests/empty.js");

require('./tests/unit/renderers/lit.js');
require('./tests/unit/services/service-container.js');
