"use strict";

require = require("esm")(module
/*, options*/
);

module.exports.proxy = path => require(path);