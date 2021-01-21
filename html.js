// Server specific exports
const { html, renderToString } = require("@popeindustries/lit-html-server");
const { unsafeHTML } = require("@popeindustries/lit-html-server/directives/unsafe-html");

module.exports = {
    html,
    unsafeHTML,
    render: renderToString
};
