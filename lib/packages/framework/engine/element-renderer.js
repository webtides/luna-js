"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderComponent = void 0;

var _cache = require("../cache/cache");

var _litHtmlServer = require("@popeindustries/lit-html-server");

var _unsafeHtml = require("@popeindustries/lit-html-server/directives/unsafe-html");

var _paramCase = require("param-case");

const getComponentCacheKey = (component, attributes = {}) => {
  return `${component.element.name}.${JSON.stringify(attributes)};`;
};
/**
 * Takes a single component object and renders the element.
 * Fetches all dynamic properties for the component & loads
 * the static properties.
 *
 * @param component ({ element: * })
 * @param attributes
 * @param onElementLoaded
 *
 * @returns {Promise<{markup: string, element: *}>}
 */


const renderComponent = async ({
  component,
  attributes = {},
  request,
  response
}) => {
  var _component$element$st;

  const cachedValue = await (0, _cache.loadFromCache)(getComponentCacheKey(component, attributes), "components");

  if (cachedValue) {
    return cachedValue;
  }

  attributes["ssr"] = true;
  const element = new component.element(); // Here we are defining the standard properties.

  element.defineProperties(); // Then we are defining the attributes from the element as properties.

  Object.keys(attributes).forEach(key => {
    let attributeToDefine = attributes[key];

    try {
      attributeToDefine = JSON.parse(attributes[key]);
    } catch {}

    element.defineProperty((0, _paramCase.paramCase)(key), attributeToDefine);
  });
  const dynamicProperties = await element.loadDynamicProperties({
    request,
    response
  });
  const properties = { ...((_component$element$st = component.element.staticProperties) !== null && _component$element$st !== void 0 ? _component$element$st : {}),
    ...(dynamicProperties ? dynamicProperties : {})
  }; // At last we are defining external properties.

  Object.keys(properties).forEach(key => {
    element.defineProperty(key, properties[key]);
  }); // Write the element properties back to attributes.

  Object.keys(element.properties()).forEach(key => {
    attributes[(0, _paramCase.paramCase)(key)] = typeof properties[key] === "string" ? properties[key] : JSON.stringify(properties[key]);
  });
  const markup = await (0, _litHtmlServer.renderToString)(element.template({
    html: _litHtmlServer.html,
    unsafeHTML: _unsafeHtml.unsafeHTML
  }));
  const dependencies = element.dependencies();

  if (!dynamicProperties) {
    await (0, _cache.writeToCache)(getComponentCacheKey(component, attributes), {
      markup,
      element
    }, "components");
  }

  return {
    markup,
    element,
    dependencies
  };
};

exports.renderComponent = renderComponent;