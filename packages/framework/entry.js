require("@babel/register")({
    // @babel/register ignore node_modules by default, so
    // we need to override the default "ignore" value.
    ignore: [],
    cache: true
});

require = require("esm")(module/*, options*/)

module.exports = require("./index.js")
