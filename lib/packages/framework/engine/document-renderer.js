"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cheerio = _interopRequireDefault(require("cheerio"));

var _componentLoader = require("../loaders/component-loader");

var _config = require("../config");

var _elementRenderer = require("./element-renderer");

var _paramCase = require("param-case");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes a cheerio-node and tries to match it with a custom element.
 * Recursively renders & upgrades all child elements.
 *
 * @param node Node
 * @param upgradedElements *
 * @param {*}
 *
 * @returns {Promise<boolean|{component: ({file: string, relativePath: string, name: *, element: *}|boolean), innerHTML: (jQuery|string), attributes: (*|{})}>}
 */
const renderNodeAsCustomElement = async (node, upgradedElements, {
  request,
  response
}) => {
  const tag = node.tagName;
  const component = await (0, _componentLoader.loadSingleComponentByTagName)(tag);

  if (!component) {
    return false;
  }

  if (component.element.disableSSR) {
    return {
      component,
      noSSR: true
    };
  }

  const attributes = Object.assign({}, node.attribs) || {};
  const {
    markup,
    element
  } = await (0, _elementRenderer.renderComponent)({
    component,
    attributes,
    request,
    response
  });
  const innerDocument = await parseHtmlDocument(_cheerio.default.load(markup, null, false), upgradedElements, {
    request,
    response
  });
  return {
    attributes,
    component,
    innerHTML: !element._options.shadowRender ? innerDocument.html() : ""
  };
};
/**
 * Takes a cheerio object and tries to renders all available custom elements.
 *
 * @param $
 * @param upgradedElements
 * @param {*}
 *
 * @returns {Promise<jQuery|HTMLElement>}
 */


const parseHtmlDocument = async ($, upgradedElements, {
  request,
  response
}) => {
  await Promise.all($("*").map(async (index, node) => {
    if (node.tagName.includes("-")) {
      // This is potentially a custom element.
      const result = await renderNodeAsCustomElement(node, upgradedElements, {
        request,
        response
      });

      if (!result) {
        return;
      }

      if (result.noSSR) {
        upgradedElements[node.tagName] = result.component;
        return;
      }

      const {
        component,
        attributes,
        innerHTML
      } = result;
      const $node = $(node);
      $node.html(innerHTML);
      attributes && Object.keys(attributes).forEach(key => $node.attr(key, attributes[key]));
      upgradedElements[node.tagName] = component;
    }
  }));
  return $;
};

const appendUpgradedElementsToDocument = async ($, upgradedElements) => {
  const settings = await (0, _config.loadSettings)();
  $("body").append(`<script type="module" src="/moon.js"></script>`).append(`
            <script type="module">
                ${Object.keys(upgradedElements).map(key => {
    const component = upgradedElements[key];
    const relativePath = component.outputDirectory.substring(settings.publicDirectory.length);
    const componentPath = component.relativePath.split("/").pop();
    return `
                            import ${component.name} from "${relativePath}/${componentPath}";
                            customElements.define("${(0, _paramCase.paramCase)(component.name)}", ${component.name});
                        `;
  }).join("\n")}
            </script>
        `);
};
/**
 * Takes a whole html document and renders all custom elements
 *
 * @param htmlDocument
 * @param request
 * @param response
 * @returns {Promise<string>}
 */


var _default = async (htmlDocument, {
  request,
  response
}) => {
  const $ = _cheerio.default.load(htmlDocument, null, true);

  const upgradedElements = {};
  await parseHtmlDocument($, upgradedElements, {
    request,
    response
  });
  await appendUpgradedElementsToDocument($, upgradedElements);
  return $.html();
};

exports.default = _default;