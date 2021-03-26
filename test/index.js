global.previousWorkingDirectory = process.cwd();

global.getCurrentWorkingDirectory = fixture => {
    return global.previousWorkingDirectory + "/test/fixtures/" + fixture;
};

require("./tests/empty.js");
require("./tests/basic.js");
require("./tests/legacy.js");
