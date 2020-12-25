require("@babel/register")({
    // @babel/register ignore node_modules by default, so
    // we need to override the default "ignore" value.
    ignore: [],

    cache: false
});

require = require("esm")(module/*, options*/)

const fs = require("fs");

require.extensions['.css'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
module.exports = require("./index.js")
