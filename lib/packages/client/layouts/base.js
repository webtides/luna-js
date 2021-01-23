"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.scripts = void 0;

const scripts = ({
  html
}) => {
  return html`
        <script src="/libraries/webcomponents-bundle.js" nomodule></script>
        <script src="/libraries/runtime.js" nomodule></script>
        <script src="/assets/bundle.legacy.js" nomodule></script>
    `;
};

exports.scripts = scripts;

const template = ({
  html,
  context
}) => {
  var _context$title, _context$head, _context$page, _context$footer;

  return html`
        <!doctype html>
        <html lang="">
            <head>
                <title>${(_context$title = context.title) !== null && _context$title !== void 0 ? _context$title : ""}</title>
                ${(_context$head = context.head) !== null && _context$head !== void 0 ? _context$head : ""}
            </head>
            <body>
                ${(_context$page = context.page) !== null && _context$page !== void 0 ? _context$page : ""}

                ${(_context$footer = context.footer) !== null && _context$footer !== void 0 ? _context$footer : ""}
                
                ${scripts({
    html
  })}
            </body>
        </html>
    `;
};

var _default = template;
exports.default = _default;