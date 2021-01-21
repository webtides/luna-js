'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      }
    });
  }
  n['default'] = e;
  return Object.freeze(n);
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function isObjectLike(value) {
  return typeof value == 'object' && value !== null;
}
function isJSON(str) {
  try {
    return JSON.parse(str) && !!str;
  } catch (e) {
    return false;
  }
}
function isBoolean(value) {
  return value === 'true' || value === 'false';
}
function parseBoolean(value) {
  return value === 'true';
}
function isString(value) {
  return typeof value === 'string' || !!value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object String]';
}
function isNumber(value) {
  return new RegExp('^-?(0|0\\.\\d+|[1-9]\\d*(\\.\\d+)?)$').test(value);
}
function isNaN(value) {
  return Number.isNaN(value);
}
function parseAttribute(value) {
  if (!isString(value)) {
    return value;
  }

  let parsedValue = value;
  if (isJSON(value)) parsedValue = JSON.parse(value);else if (isBoolean(value)) parsedValue = parseBoolean(value);else if (isNumber(value)) parsedValue = parseFloat(value);
  return parsedValue;
}
/**
 * Replaces dashed-expression (i.e. some-value) to a camel-cased expression (i.e. someValue)
 * @returns string
 */

function dashToCamel(string) {
  if (string.indexOf('-') === -1) return string;
  return string.replace(/-[a-z]/g, matches => matches[1].toUpperCase());
}
/**
 * Replaces camel-cased expression (i.e. someValue) to a dashed-expression (i.e. some-value)
 * @returns string
 */

function camelToDash(string) {
  return string.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function getShadowParentOrBody(element) {
  if (element instanceof ShadowRoot) {
    return element;
  }

  while (element.parentNode && (element = element.parentNode)) {
    if (element instanceof ShadowRoot) {
      return element;
    }
  }

  return document.body;
} // TODO: add function for getClosestParentOfNodeType('custom-element')
const supportsAdoptingStyleSheets = () => 'adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype; // for IE11 we are using the ShadyDOM Polyfill. With the polyfill we cannot append stylesheets to the shadowRoot

class BaseElement extends HTMLElement {
  constructor(options = {}) {
    super();
    this.$refs = {};
    this._state = {};
    this._mutationObserver = null;
    this._registeredEvents = [];
    this._batchUpdate = null;
    this._requestedUpdates = [];
    this._options = {
      autoUpdate: true,
      deferUpdate: true,
      mutationObserverOptions: {
        attributes: true,
        childList: true,
        subtree: false,
        ...options.mutationObserverOptions
      },
      propertyOptions: {},
      ...options
    };

    if (options.childListUpdate !== undefined && options.childListUpdate !== null) {
      this._options.mutationObserverOptions.childList = options.childListUpdate;
      console.warn(`[${this.localName}] Using the "childListUpdate" option is deprecated and will be removed before 1.0! Please use the "mutationObserverOptions" dictionary instead. See the docs for more info`);
    }
  }

  connectedCallback() {
    // define all attributes to "this" as properties
    this.defineAttributesAsProperties(); // define all properties to "this"

    this.defineProperties(); // define all computed properties to "this"

    this.defineComputedProperties(); // define everything that should be observed

    this.defineObserver();

    if (this.hasAttribute('defer-update') || this._options.deferUpdate) {
      // don't updates/render, but register refs and events
      this.registerEventsAndRefs();
      this.triggerHook('connected');
    } else {
      this.requestUpdate({
        notify: false
      }).then(() => {
        this.triggerHook('connected');
      });
    }
  }

  defineObserver() {
    // see: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#Example_usage
    this._mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.target === this && this._state.hasOwnProperty(dashToCamel(mutation.attributeName))) {
          // update property by invoking the setter
          this[dashToCamel(mutation.attributeName)] = parseAttribute(this.getAttribute(mutation.attributeName));
        }

        if (mutation.type === 'attributes' && mutation.target !== this) {
          this.requestUpdate();
        }

        if (mutation.type === 'childList') {
          this.requestUpdate();
        }
      });
    });

    this._mutationObserver.observe(this, {
      attributes: true,
      childList: true,
      subtree: false,
      ...this._options.mutationObserverOptions
    });
  }

  disconnectedCallback() {
    // remove events for elements in the component
    this.removeEvents(); // remove observers

    if (this._mutationObserver) this._mutationObserver.disconnect();
    this.triggerHook('disconnected');
  }

  requestUpdate(options = {
    notify: true
  }) {
    if (options.notify === true) {
      this.triggerHook('beforeUpdate');
    }

    if (this._batchUpdate) {
      cancelAnimationFrame(this._batchUpdate);
      this._batchUpdate = false;
    }

    return new Promise((resolve, reject) => {
      this._requestedUpdates.push({
        resolve,
        reject
      });

      this._batchUpdate = requestAnimationFrame(() => {
        try {
          this.update(options);

          this._requestedUpdates.forEach(({
            resolve,
            reject
          }) => resolve());
        } catch (e) {
          // console.error('Update error', e)
          this._requestedUpdates.forEach(({
            resolve,
            reject
          }) => reject(e));
        }

        this._requestedUpdates = [];
      });
    });
  }
  /**
   * This should be called by the template component AFTER adding the template to
   * the DOM.
   * Here we will register the events and the refs for the element.
   */


  update(options = {
    notify: true
  }) {
    this.registerEventsAndRefs();

    if (options.notify === true) {
      this.triggerHook('afterUpdate');
    }
  }
  /**
   * Register events and refs for the component
   */


  registerEventsAndRefs() {
    // register events for elements in the component
    this.registerEvents(); // register $refs

    this.registerRefs();
  }
  /**
   * Defines all attributes assigned in the HTML for the element as properties on the element
   * If the value for an attribute can be parsed to an object or array, it will do so
   */


  defineAttributesAsProperties() {
    const ignoreAttributes = ['class', 'style'];
    Array.from(this.attributes).filter(attribute => {
      return !ignoreAttributes.includes(attribute.name);
    }).forEach(attribute => {
      this.defineProperty(dashToCamel(attribute.name), parseAttribute(attribute.value), true);
    });
  }
  /**
   * Properties to be defined and assigned on the element. Should be overwritten in child components
   * Properties defined here will also trigger a update() when changed.
   * eg. { stringProperty: 'value', numberProperty: 13, booleanProperty: true } }
   * @return {{}}
   */


  properties() {
    return {};
  }
  /**
   * Defines properties on the element based on keys from this.properties()
   * Will trigger update() when a property was changed
   */


  defineProperties() {
    Object.keys(this.properties()).forEach(prop => {
      // when mixing shadow dom elements with light dom elements and nesting custom elements
      // it might occur that properties where set on an element before it was
      // registered or connected. To avoid such timing issues we check
      // if a value was set for that specific property on the
      // prototype before assigning a default value
      const value = this[prop] || this.properties()[prop];
      this.defineProperty(prop, value);
    });
  }
  /**
   * Define a property on the element
   * Will trigger watch() function when a property was changed
   * Will trigger update() when a property was changed
   */


  defineProperty(property, value, reflectAttribute = false) {
    var _this$_options$proper, _this$_options$proper2;

    if (this._state.hasOwnProperty(property)) {
      // property has already been defined as an attribute nothing to do here
      return;
    } // if property did not come from an attribute but has the option to reflect


    if (!reflectAttribute && ((_this$_options$proper = this._options.propertyOptions[property]) === null || _this$_options$proper === void 0 ? void 0 : _this$_options$proper.reflect) === true) {
      this.reflectProperty({
        property: property,
        newValue: value
      });
    } // remove attribute if reflect is set to false explicitly in options


    if (((_this$_options$proper2 = this._options.propertyOptions[property]) === null || _this$_options$proper2 === void 0 ? void 0 : _this$_options$proper2.reflect) === false) {
      this.removeAttribute(camelToDash(property));
    }

    this._state[property] = value;
    Object.defineProperty(this, property, {
      get: () => {
        return this._state[property];
      },
      set: newValue => {
        const oldValue = this._state[property];
        const newValueString = JSON.stringify(newValue);

        if (JSON.stringify(oldValue) !== newValueString) {
          var _this$_options$proper3;

          this._state[property] = newValue;

          if (reflectAttribute || ((_this$_options$proper3 = this._options.propertyOptions[property]) === null || _this$_options$proper3 === void 0 ? void 0 : _this$_options$proper3.reflect) === true) {
            this.reflectProperty({
              property,
              newValue,
              newValueString
            });
          }

          const informWatchedPropertiesAndDispatchChangeEvent = () => {
            // notify watched properties (after update())
            if (property in this.watch()) {
              this.watch()[property](newValue, oldValue);
            } // dispatch change event


            if (property in this._options['propertyOptions'] && this._options['propertyOptions'][property]['notify'] === true) {
              this.dispatch(`${camelToDash(property)}-changed`, newValue, true);
            }
          };

          if (this._options.autoUpdate) {
            this.requestUpdate({
              notify: true,
              property: property,
              newValue: newValue,
              newValueString: newValueString,
              oldValue: oldValue
            }).finally(() => {
              informWatchedPropertiesAndDispatchChangeEvent();
            });
          } else {
            informWatchedPropertiesAndDispatchChangeEvent();
          }
        }

        return this;
      }
    });
  }

  reflectProperty(options) {
    const {
      property,
      newValue
    } = options;
    const newValueString = options.newValueString || JSON.stringify(newValue);

    if (newValue === undefined || newValue === null || isNaN(newValue)) {
      // these would be reflected as strings: "undefined" || "null" || "NaN"
      // which is not the desired behaviour. Therefore we reflect them as empty strings
      this.setAttribute(camelToDash(property), '');
    } else {
      const attributeValue = isObjectLike(newValue) ? newValueString : newValue;
      this.setAttribute(camelToDash(property), attributeValue);
    }
  } // Deprecated


  hooks() {
    return {};
  } // Connected lifecycle hook


  connected() {} // BeforeUpdate lifecycle hook


  beforeUpdate() {} // AfterUpdate lifecycle hook


  afterUpdate() {} // Disconnected lifecycle hook


  disconnected() {} // Triggers a lifecycle hook based on the name


  triggerHook(name) {
    if (this.hooks && name in this.hooks()) {
      console.warn(`[${this.localName}] Using the hooks() map for lifecycle hooks is deprecated! Please overwrite the existing lifecycle hook functions. See the docs for more info`);
      this.hooks()[name]();
      return;
    }

    if (name in this) {
      this[name]();
    }
  }
  /**
   * Watched attributes & properties to be notified to the element when changed. Should be overwritten in child components
   * When an attribute or property as the key was changed on the element, the callback function defined as value
   * will be called with `newValue` and `oldValue`
   * eg. { property: (oldValue, newValue) => { console.log('property changed!, oldValue, newValue); } }
   * @return {{}}
   */


  watch() {
    return {};
  } // Deprecated


  computed() {
    return {};
  } // Deprecated


  defineComputedProperties() {
    Object.keys(this.computed()).forEach(prop => {
      if (!this.hasOwnProperty(prop)) {
        console.warn(`[${this.localName}] Using the computed() map for computed properties is deprecated! Please use regular JS getters and return the computed value. See the docs for more info`);
        Object.defineProperty(this, prop, {
          get: () => this.computed()[prop]()
        });
      }
    });
  }
  /**
   * Return a map of events that should be registered on the element.
   * eg. { '.link': {
   *               'click': (e) => {console.log('MyElement.link - clicked', e)},
   *               'mouseover': (e) => {console.log('MyElement.link - mouseover()', e)},
   *           }
   *     }
   */


  events() {
    return {};
  }
  /**
   * Registers events on the element based on events().
   * Removes all previously registered events before adding them.
   */


  registerEvents() {
    // remove all previously registered events to prevent duplicate triggers
    this.removeEvents(); // register events

    const eventDefinitions = this.events();
    Object.keys(eventDefinitions).forEach(elementSelector => {
      const events = eventDefinitions[elementSelector];
      const selectorWhiteList = {
        window,
        document,
        this: this.getRoot()
      };
      const whiteListElement = selectorWhiteList[elementSelector];
      const eventTargets = whiteListElement ? [whiteListElement] : this.getRoot().querySelectorAll(elementSelector);
      eventTargets.forEach(eventTarget => {
        Object.keys(events).forEach(eventName => {
          const callback = events[eventName].bind(this);
          eventTarget.addEventListener(eventName, callback);

          this._registeredEvents.push({
            eventTarget,
            eventName,
            callback
          });
        });
      });
    });
  }
  /**
   * Removes all events from the element that where previously registered from the events() map.
   */


  removeEvents() {
    this._registeredEvents.forEach(({
      eventTarget,
      eventName,
      callback
    }) => {
      if (eventTarget === window || eventTarget === document || this.getRoot().contains(eventTarget)) {
        eventTarget.removeEventListener(eventName, callback);
      }
    });

    this._registeredEvents = [];
  }
  /**
   * Stores an object that references child elements & DOM nodes that have a ref attribute defined.
   * References will be accessible on the element under this.$refs
   */


  registerRefs() {
    const refsNodeList = this.getRoot().querySelectorAll('[ref]');
    const refsArray = Array.from(refsNodeList);
    const refsMap = {};
    refsArray.forEach(refNode => {
      const refKey = refNode.getAttribute('ref');
      refsMap[refKey] = refNode;
    });
    this.$refs = refsMap;
  } // Helper function for dispatching custom events


  dispatch(name, data, bubble = false, cancelable = false, composed = false) {
    const event = new CustomEvent(name, {
      bubbles: bubble,
      cancelable: cancelable,
      composed: composed,
      detail: data
    });
    this.dispatchEvent(event);
  } // Get the root element


  getRoot() {
    return this;
  }

}

class StyledElement extends BaseElement {
  static updateGlobalStyles() {
    // this is a runtime dependency so that every shadow dom can make use of global css
    // we assume these styles to be inlined into the document
    StyledElement.globalStyles = document.getElementById('globalStyles');

    if (StyledElement.globalStyles && StyledElement['globalStyleSheet']) {
      //updates already adopted global styles
      StyledElement['globalStyleSheet'].replaceSync(StyledElement.globalStyles.textContent);
    }
  }

  constructor(options) {
    super({
      deferUpdate: false,
      shadowRender: false,
      styles: [],
      adoptGlobalStyles: true,
      ...options
    });
    this._styles = [...this._options.styles, ...this.styles()];
  }

  connectedCallback() {
    super.connectedCallback();

    if (supportsAdoptingStyleSheets() && this._options.shadowRender) {
      // adopting does only make sense in shadow dom. Fall back to append for light elements
      this.adoptStyleSheets();
    } else if (this._options.shadowRender && window.ShadyCSS !== undefined) {
      // if shadowRoot is polyfilled we use ShadyCSS to copy scoped styles to <head>
      window.ShadyCSS.ScopingShim.prepareAdoptedCssText(this._styles, this.localName);
    } // if shadowRoot is polyfilled - scope element template


    if (window.ShadyCSS !== undefined) {
      window.ShadyCSS.styleElement(this);
    }
  }

  styles() {
    return [];
  }

  update(options) {
    if (!supportsAdoptingStyleSheets() || this._options.shadowRender === false) {
      // append stylesheets to template if not already adopted
      const appendableStyles = [...this._styles];

      if (this._options.shadowRender && this._options.adoptGlobalStyles && !window.ShadyCSS) {
        var _StyledElement$global, _StyledElement$global2;

        appendableStyles.unshift((_StyledElement$global = (_StyledElement$global2 = StyledElement.globalStyles) === null || _StyledElement$global2 === void 0 ? void 0 : _StyledElement$global2.textContent) !== null && _StyledElement$global !== void 0 ? _StyledElement$global : '');
      }

      this.appendStyleSheets(appendableStyles);
    }

    super.update(options);
  }

  adoptStyleSheets() {
    if (!this.constructor['cssStyleSheets']) {
      this.constructor['cssStyleSheets'] = this._styles.map(style => {
        const sheet = new CSSStyleSheet();

        if (sheet && sheet.cssRules.length === 0) {
          sheet.replaceSync(style);
        }

        return sheet;
      });
    }

    if (StyledElement.globalStyles && !StyledElement['globalStyleSheet']) {
      StyledElement['globalStyleSheet'] = new CSSStyleSheet();
      StyledElement['globalStyleSheet'].replaceSync(StyledElement.globalStyles.textContent);
    } // adopt styles
    // uses proposed solution for constructable stylesheets
    // see: https://wicg.github.io/construct-stylesheets/#proposed-solution


    this.getRoot().adoptedStyleSheets = [...(this._options.shadowRender && this._options.adoptGlobalStyles && StyledElement['globalStyleSheet'] ? [StyledElement['globalStyleSheet']] : []), ...this.constructor['cssStyleSheets']];
  } // custom polyfill for constructable stylesheets by appending styles to the end of an element


  appendStyleSheets(styles) {
    const parentDocument = getShadowParentOrBody(this.getRoot());
    styles.forEach((style, index) => {
      const identifier = this.tagName + index; // only append stylesheet if not already appended to shadowRoot or document

      if (!parentDocument.querySelector(`#${identifier}`)) {
        const styleElement = document.createElement('style');
        styleElement.id = identifier;
        styleElement.style.display = 'none';
        styleElement.textContent = style;
        parentDocument.appendChild(styleElement);
      }
    });
  }

}

_defineProperty(StyledElement, "globalStyles", null);

StyledElement.updateGlobalStyles();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const directives = new WeakMap();
/**
 * Brands a function as a directive factory function so that lit-html will call
 * the function during template rendering, rather than passing as a value.
 *
 * A _directive_ is a function that takes a Part as an argument. It has the
 * signature: `(part: Part) => void`.
 *
 * A directive _factory_ is a function that takes arguments for data and
 * configuration and returns a directive. Users of directive usually refer to
 * the directive factory as the directive. For example, "The repeat directive".
 *
 * Usually a template author will invoke a directive factory in their template
 * with relevant arguments, which will then return a directive function.
 *
 * Here's an example of using the `repeat()` directive factory that takes an
 * array and a function to render an item:
 *
 * ```js
 * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
 * ```
 *
 * When `repeat` is invoked, it returns a directive function that closes over
 * `items` and the template function. When the outer template is rendered, the
 * return directive function is called with the Part for the expression.
 * `repeat` then performs it's custom logic to render multiple items.
 *
 * @param f The directive factory function. Must be a function that returns a
 * function of the signature `(part: Part) => void`. The returned function will
 * be called with the part object.
 *
 * @example
 *
 * import {directive, html} from 'lit-html';
 *
 * const immutable = directive((v) => (part) => {
 *   if (part.value !== v) {
 *     part.setValue(v)
 *   }
 * });
 */

const directive = f => (...args) => {
  const d = f(...args);
  directives.set(d, true);
  return d;
};
const isDirective = o => {
  return typeof o === 'function' && directives.has(o);
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

/**
 * True if the custom elements polyfill is in use.
 */
const isCEPolyfill = typeof window !== 'undefined' && window.customElements != null && window.customElements.polyfillWrapFlushCallback !== undefined;
/**
 * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
 * `container`.
 */

const removeNodes = (container, start, end = null) => {
  while (start !== end) {
    const n = start.nextSibling;
    container.removeChild(start);
    start = n;
  }
};

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = {};
/**
 * A sentinel value that signals a NodePart to fully clear its content.
 */

const nothing = {};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
/**
 * An expression marker used text-positions, multi-binding attributes, and
 * attributes with markup-like text values.
 */

const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
/**
 * Suffix appended to all bound attribute names.
 */

const boundAttributeSuffix = '$lit$';
/**
 * An updatable Template that tracks the location of dynamic parts.
 */

class Template {
  constructor(result, element) {
    this.parts = [];
    this.element = element;
    const nodesToRemove = [];
    const stack = []; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

    const walker = document.createTreeWalker(element.content, 133
    /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
    , null, false); // Keeps track of the last index associated with a part. We try to delete
    // unnecessary nodes, but we never want to associate two different parts
    // to the same index. They must have a constant node between.

    let lastPartIndex = 0;
    let index = -1;
    let partIndex = 0;
    const {
      strings,
      values: {
        length
      }
    } = result;

    while (partIndex < length) {
      const node = walker.nextNode();

      if (node === null) {
        // We've exhausted the content inside a nested template element.
        // Because we still have parts (the outer for-loop), we know:
        // - There is a template in the stack
        // - The walker will find a nextNode outside the template
        walker.currentNode = stack.pop();
        continue;
      }

      index++;

      if (node.nodeType === 1
      /* Node.ELEMENT_NODE */
      ) {
          if (node.hasAttributes()) {
            const attributes = node.attributes;
            const {
              length
            } = attributes; // Per
            // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
            // attributes are not guaranteed to be returned in document order.
            // In particular, Edge/IE can return them out of order, so we cannot
            // assume a correspondence between part index and attribute index.

            let count = 0;

            for (let i = 0; i < length; i++) {
              if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                count++;
              }
            }

            while (count-- > 0) {
              // Get the template literal section leading up to the first
              // expression in this attribute
              const stringForPart = strings[partIndex]; // Find the attribute name

              const name = lastAttributeNameRegex.exec(stringForPart)[2]; // Find the corresponding attribute
              // All bound attributes have had a suffix added in
              // TemplateResult#getHTML to opt out of special attribute
              // handling. To look up the attribute value we also need to add
              // the suffix.

              const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
              const attributeValue = node.getAttribute(attributeLookupName);
              node.removeAttribute(attributeLookupName);
              const statics = attributeValue.split(markerRegex);
              this.parts.push({
                type: 'attribute',
                index,
                name,
                strings: statics
              });
              partIndex += statics.length - 1;
            }
          }

          if (node.tagName === 'TEMPLATE') {
            stack.push(node);
            walker.currentNode = node.content;
          }
        } else if (node.nodeType === 3
      /* Node.TEXT_NODE */
      ) {
          const data = node.data;

          if (data.indexOf(marker) >= 0) {
            const parent = node.parentNode;
            const strings = data.split(markerRegex);
            const lastIndex = strings.length - 1; // Generate a new text node for each literal section
            // These nodes are also used as the markers for node parts

            for (let i = 0; i < lastIndex; i++) {
              let insert;
              let s = strings[i];

              if (s === '') {
                insert = createMarker();
              } else {
                const match = lastAttributeNameRegex.exec(s);

                if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                  s = s.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                }

                insert = document.createTextNode(s);
              }

              parent.insertBefore(insert, node);
              this.parts.push({
                type: 'node',
                index: ++index
              });
            } // If there's no text, we must insert a comment to mark our place.
            // Else, we can trust it will stick around after cloning.


            if (strings[lastIndex] === '') {
              parent.insertBefore(createMarker(), node);
              nodesToRemove.push(node);
            } else {
              node.data = strings[lastIndex];
            } // We have a part for each match found


            partIndex += lastIndex;
          }
        } else if (node.nodeType === 8
      /* Node.COMMENT_NODE */
      ) {
          if (node.data === marker) {
            const parent = node.parentNode; // Add a new marker node to be the startNode of the Part if any of
            // the following are true:
            //  * We don't have a previousSibling
            //  * The previousSibling is already the start of a previous part

            if (node.previousSibling === null || index === lastPartIndex) {
              index++;
              parent.insertBefore(createMarker(), node);
            }

            lastPartIndex = index;
            this.parts.push({
              type: 'node',
              index
            }); // If we don't have a nextSibling, keep this node so we have an end.
            // Else, we can remove it to save future costs.

            if (node.nextSibling === null) {
              node.data = '';
            } else {
              nodesToRemove.push(node);
              index--;
            }

            partIndex++;
          } else {
            let i = -1;

            while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
              // Comment node has a binding marker inside, make an inactive part
              // The binding won't work, but subsequent bindings will
              // TODO (justinfagnani): consider whether it's even worth it to
              // make bindings in comments work
              this.parts.push({
                type: 'node',
                index: -1
              });
              partIndex++;
            }
          }
        }
    } // Remove text binding nodes after the walk to not disturb the TreeWalker


    for (const n of nodesToRemove) {
      n.parentNode.removeChild(n);
    }
  }

}

const endsWith = (str, suffix) => {
  const index = str.length - suffix.length;
  return index >= 0 && str.slice(index) === suffix;
};

const isTemplatePartActive = part => part.index !== -1; // Allows `document.createComment('')` to be renamed for a
// small manual size-savings.

const createMarker = () => document.createComment('');
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-characters
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
 * space character except " ".
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */

const lastAttributeNameRegex = // eslint-disable-next-line no-control-regex
/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */

class TemplateInstance {
  constructor(template, processor, options) {
    this.__parts = [];
    this.template = template;
    this.processor = processor;
    this.options = options;
  }

  update(values) {
    let i = 0;

    for (const part of this.__parts) {
      if (part !== undefined) {
        part.setValue(values[i]);
      }

      i++;
    }

    for (const part of this.__parts) {
      if (part !== undefined) {
        part.commit();
      }
    }
  }

  _clone() {
    // There are a number of steps in the lifecycle of a template instance's
    // DOM fragment:
    //  1. Clone - create the instance fragment
    //  2. Adopt - adopt into the main document
    //  3. Process - find part markers and create parts
    //  4. Upgrade - upgrade custom elements
    //  5. Update - set node, attribute, property, etc., values
    //  6. Connect - connect to the document. Optional and outside of this
    //     method.
    //
    // We have a few constraints on the ordering of these steps:
    //  * We need to upgrade before updating, so that property values will pass
    //    through any property setters.
    //  * We would like to process before upgrading so that we're sure that the
    //    cloned fragment is inert and not disturbed by self-modifying DOM.
    //  * We want custom elements to upgrade even in disconnected fragments.
    //
    // Given these constraints, with full custom elements support we would
    // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
    //
    // But Safari does not implement CustomElementRegistry#upgrade, so we
    // can not implement that order and still have upgrade-before-update and
    // upgrade disconnected fragments. So we instead sacrifice the
    // process-before-upgrade constraint, since in Custom Elements v1 elements
    // must not modify their light DOM in the constructor. We still have issues
    // when co-existing with CEv0 elements like Polymer 1, and with polyfills
    // that don't strictly adhere to the no-modification rule because shadow
    // DOM, which may be created in the constructor, is emulated by being placed
    // in the light DOM.
    //
    // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
    // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
    // in one step.
    //
    // The Custom Elements v1 polyfill supports upgrade(), so the order when
    // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
    // Connect.
    const fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
    const stack = [];
    const parts = this.template.parts; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

    const walker = document.createTreeWalker(fragment, 133
    /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
    , null, false);
    let partIndex = 0;
    let nodeIndex = 0;
    let part;
    let node = walker.nextNode(); // Loop through all the nodes and parts of a template

    while (partIndex < parts.length) {
      part = parts[partIndex];

      if (!isTemplatePartActive(part)) {
        this.__parts.push(undefined);

        partIndex++;
        continue;
      } // Progress the tree walker until we find our next part's node.
      // Note that multiple parts may share the same node (attribute parts
      // on a single element), so this loop may not run at all.


      while (nodeIndex < part.index) {
        nodeIndex++;

        if (node.nodeName === 'TEMPLATE') {
          stack.push(node);
          walker.currentNode = node.content;
        }

        if ((node = walker.nextNode()) === null) {
          // We've exhausted the content inside a nested template element.
          // Because we still have parts (the outer for-loop), we know:
          // - There is a template in the stack
          // - The walker will find a nextNode outside the template
          walker.currentNode = stack.pop();
          node = walker.nextNode();
        }
      } // We've arrived at our part's node.


      if (part.type === 'node') {
        const part = this.processor.handleTextExpression(this.options);
        part.insertAfterNode(node.previousSibling);

        this.__parts.push(part);
      } else {
        this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
      }

      partIndex++;
    }

    if (isCEPolyfill) {
      document.adoptNode(fragment);
      customElements.upgrade(fragment);
    }

    return fragment;
  }

}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Our TrustedTypePolicy for HTML which is declared using the html template
 * tag function.
 *
 * That HTML is a developer-authored constant, and is parsed with innerHTML
 * before any untrusted expressions have been mixed in. Therefor it is
 * considered safe by construction.
 */

const policy = window.trustedTypes && trustedTypes.createPolicy('lit-html', {
  createHTML: s => s
});
const commentMarker = ` ${marker} `;
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */

class TemplateResult {
  constructor(strings, values, type, processor) {
    this.strings = strings;
    this.values = values;
    this.type = type;
    this.processor = processor;
  }
  /**
   * Returns a string of HTML used to create a `<template>` element.
   */


  getHTML() {
    const l = this.strings.length - 1;
    let html = '';
    let isCommentBinding = false;

    for (let i = 0; i < l; i++) {
      const s = this.strings[i]; // For each binding we want to determine the kind of marker to insert
      // into the template source before it's parsed by the browser's HTML
      // parser. The marker type is based on whether the expression is in an
      // attribute, text, or comment position.
      //   * For node-position bindings we insert a comment with the marker
      //     sentinel as its text content, like <!--{{lit-guid}}-->.
      //   * For attribute bindings we insert just the marker sentinel for the
      //     first binding, so that we support unquoted attribute bindings.
      //     Subsequent bindings can use a comment marker because multi-binding
      //     attributes must be quoted.
      //   * For comment bindings we insert just the marker sentinel so we don't
      //     close the comment.
      //
      // The following code scans the template source, but is *not* an HTML
      // parser. We don't need to track the tree structure of the HTML, only
      // whether a binding is inside a comment, and if not, if it appears to be
      // the first binding in an attribute.

      const commentOpen = s.lastIndexOf('<!--'); // We're in comment position if we have a comment open with no following
      // comment close. Because <-- can appear in an attribute value there can
      // be false positives.

      isCommentBinding = (commentOpen > -1 || isCommentBinding) && s.indexOf('-->', commentOpen + 1) === -1; // Check to see if we have an attribute-like sequence preceding the
      // expression. This can match "name=value" like structures in text,
      // comments, and attribute values, so there can be false-positives.

      const attributeMatch = lastAttributeNameRegex.exec(s);

      if (attributeMatch === null) {
        // We're only in this branch if we don't have a attribute-like
        // preceding sequence. For comments, this guards against unusual
        // attribute values like <div foo="<!--${'bar'}">. Cases like
        // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
        // below.
        html += s + (isCommentBinding ? commentMarker : nodeMarker);
      } else {
        // For attributes we use just a marker sentinel, and also append a
        // $lit$ suffix to the name to opt-out of attribute-specific parsing
        // that IE and Edge do for style and certain SVG attributes.
        html += s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] + marker;
      }
    }

    html += this.strings[l];
    return html;
  }

  getTemplateElement() {
    const template = document.createElement('template');
    let value = this.getHTML();

    if (policy !== undefined) {
      // this is secure because `this.strings` is a TemplateStringsArray.
      // TODO: validate this when
      // https://github.com/tc39/proposal-array-is-template-object is
      // implemented.
      value = policy.createHTML(value);
    }

    template.innerHTML = value;
    return template;
  }

}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const isPrimitive = value => {
  return value === null || !(typeof value === 'object' || typeof value === 'function');
};
const isIterable = value => {
  return Array.isArray(value) || // eslint-disable-next-line @typescript-eslint/no-explicit-any
  !!(value && value[Symbol.iterator]);
};
/**
 * Writes attribute values to the DOM for a group of AttributeParts bound to a
 * single attribute. The value is only set once even if there are multiple parts
 * for an attribute.
 */

class AttributeCommitter {
  constructor(element, name, strings) {
    this.dirty = true;
    this.element = element;
    this.name = name;
    this.strings = strings;
    this.parts = [];

    for (let i = 0; i < strings.length - 1; i++) {
      this.parts[i] = this._createPart();
    }
  }
  /**
   * Creates a single part. Override this to create a differnt type of part.
   */


  _createPart() {
    return new AttributePart(this);
  }

  _getValue() {
    const strings = this.strings;
    const l = strings.length - 1;
    const parts = this.parts; // If we're assigning an attribute via syntax like:
    //    attr="${foo}"  or  attr=${foo}
    // but not
    //    attr="${foo} ${bar}" or attr="${foo} baz"
    // then we don't want to coerce the attribute value into one long
    // string. Instead we want to just return the value itself directly,
    // so that sanitizeDOMValue can get the actual value rather than
    // String(value)
    // The exception is if v is an array, in which case we do want to smash
    // it together into a string without calling String() on the array.
    //
    // This also allows trusted values (when using TrustedTypes) being
    // assigned to DOM sinks without being stringified in the process.

    if (l === 1 && strings[0] === '' && strings[1] === '') {
      const v = parts[0].value;

      if (typeof v === 'symbol') {
        return String(v);
      }

      if (typeof v === 'string' || !isIterable(v)) {
        return v;
      }
    }

    let text = '';

    for (let i = 0; i < l; i++) {
      text += strings[i];
      const part = parts[i];

      if (part !== undefined) {
        const v = part.value;

        if (isPrimitive(v) || !isIterable(v)) {
          text += typeof v === 'string' ? v : String(v);
        } else {
          for (const t of v) {
            text += typeof t === 'string' ? t : String(t);
          }
        }
      }
    }

    text += strings[l];
    return text;
  }

  commit() {
    if (this.dirty) {
      this.dirty = false;
      this.element.setAttribute(this.name, this._getValue());
    }
  }

}
/**
 * A Part that controls all or part of an attribute value.
 */

class AttributePart {
  constructor(committer) {
    this.value = undefined;
    this.committer = committer;
  }

  setValue(value) {
    if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
      this.value = value; // If the value is a not a directive, dirty the committer so that it'll
      // call setAttribute. If the value is a directive, it'll dirty the
      // committer if it calls setValue().

      if (!isDirective(value)) {
        this.committer.dirty = true;
      }
    }
  }

  commit() {
    while (isDirective(this.value)) {
      const directive = this.value;
      this.value = noChange;
      directive(this);
    }

    if (this.value === noChange) {
      return;
    }

    this.committer.commit();
  }

}
/**
 * A Part that controls a location within a Node tree. Like a Range, NodePart
 * has start and end locations and can set and update the Nodes between those
 * locations.
 *
 * NodeParts support several value types: primitives, Nodes, TemplateResults,
 * as well as arrays and iterables of those types.
 */

class NodePart {
  constructor(options) {
    this.value = undefined;
    this.__pendingValue = undefined;
    this.options = options;
  }
  /**
   * Appends this part into a container.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  appendInto(container) {
    this.startNode = container.appendChild(createMarker());
    this.endNode = container.appendChild(createMarker());
  }
  /**
   * Inserts this part after the `ref` node (between `ref` and `ref`'s next
   * sibling). Both `ref` and its next sibling must be static, unchanging nodes
   * such as those that appear in a literal section of a template.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  insertAfterNode(ref) {
    this.startNode = ref;
    this.endNode = ref.nextSibling;
  }
  /**
   * Appends this part into a parent part.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  appendIntoPart(part) {
    part.__insert(this.startNode = createMarker());

    part.__insert(this.endNode = createMarker());
  }
  /**
   * Inserts this part after the `ref` part.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  insertAfterPart(ref) {
    ref.__insert(this.startNode = createMarker());

    this.endNode = ref.endNode;
    ref.endNode = this.startNode;
  }

  setValue(value) {
    this.__pendingValue = value;
  }

  commit() {
    if (this.startNode.parentNode === null) {
      return;
    }

    while (isDirective(this.__pendingValue)) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange;
      directive(this);
    }

    const value = this.__pendingValue;

    if (value === noChange) {
      return;
    }

    if (isPrimitive(value)) {
      if (value !== this.value) {
        this.__commitText(value);
      }
    } else if (value instanceof TemplateResult) {
      this.__commitTemplateResult(value);
    } else if (value instanceof Node) {
      this.__commitNode(value);
    } else if (isIterable(value)) {
      this.__commitIterable(value);
    } else if (value === nothing) {
      this.value = nothing;
      this.clear();
    } else {
      // Fallback, will render the string representation
      this.__commitText(value);
    }
  }

  __insert(node) {
    this.endNode.parentNode.insertBefore(node, this.endNode);
  }

  __commitNode(value) {
    if (this.value === value) {
      return;
    }

    this.clear();

    this.__insert(value);

    this.value = value;
  }

  __commitText(value) {
    const node = this.startNode.nextSibling;
    value = value == null ? '' : value; // If `value` isn't already a string, we explicitly convert it here in case
    // it can't be implicitly converted - i.e. it's a symbol.

    const valueAsString = typeof value === 'string' ? value : String(value);

    if (node === this.endNode.previousSibling && node.nodeType === 3
    /* Node.TEXT_NODE */
    ) {
        // If we only have a single text node between the markers, we can just
        // set its value, rather than replacing it.
        // TODO(justinfagnani): Can we just check if this.value is primitive?
        node.data = valueAsString;
      } else {
      this.__commitNode(document.createTextNode(valueAsString));
    }

    this.value = value;
  }

  __commitTemplateResult(value) {
    const template = this.options.templateFactory(value);

    if (this.value instanceof TemplateInstance && this.value.template === template) {
      this.value.update(value.values);
    } else {
      // Make sure we propagate the template processor from the TemplateResult
      // so that we use its syntax extension, etc. The template factory comes
      // from the render function options so that it can control template
      // caching and preprocessing.
      const instance = new TemplateInstance(template, value.processor, this.options);

      const fragment = instance._clone();

      instance.update(value.values);

      this.__commitNode(fragment);

      this.value = instance;
    }
  }

  __commitIterable(value) {
    // For an Iterable, we create a new InstancePart per item, then set its
    // value to the item. This is a little bit of overhead for every item in
    // an Iterable, but it lets us recurse easily and efficiently update Arrays
    // of TemplateResults that will be commonly returned from expressions like:
    // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
    // If _value is an array, then the previous render was of an
    // iterable and _value will contain the NodeParts from the previous
    // render. If _value is not an array, clear this part and make a new
    // array for NodeParts.
    if (!Array.isArray(this.value)) {
      this.value = [];
      this.clear();
    } // Lets us keep track of how many items we stamped so we can clear leftover
    // items from a previous render


    const itemParts = this.value;
    let partIndex = 0;
    let itemPart;

    for (const item of value) {
      // Try to reuse an existing part
      itemPart = itemParts[partIndex]; // If no existing part, create a new one

      if (itemPart === undefined) {
        itemPart = new NodePart(this.options);
        itemParts.push(itemPart);

        if (partIndex === 0) {
          itemPart.appendIntoPart(this);
        } else {
          itemPart.insertAfterPart(itemParts[partIndex - 1]);
        }
      }

      itemPart.setValue(item);
      itemPart.commit();
      partIndex++;
    }

    if (partIndex < itemParts.length) {
      // Truncate the parts array so _value reflects the current state
      itemParts.length = partIndex;
      this.clear(itemPart && itemPart.endNode);
    }
  }

  clear(startNode = this.startNode) {
    removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
  }

}
/**
 * Implements a boolean attribute, roughly as defined in the HTML
 * specification.
 *
 * If the value is truthy, then the attribute is present with a value of
 * ''. If the value is falsey, the attribute is removed.
 */

class BooleanAttributePart {
  constructor(element, name, strings) {
    this.value = undefined;
    this.__pendingValue = undefined;

    if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
      throw new Error('Boolean attributes can only contain a single expression');
    }

    this.element = element;
    this.name = name;
    this.strings = strings;
  }

  setValue(value) {
    this.__pendingValue = value;
  }

  commit() {
    while (isDirective(this.__pendingValue)) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange;
      directive(this);
    }

    if (this.__pendingValue === noChange) {
      return;
    }

    const value = !!this.__pendingValue;

    if (this.value !== value) {
      if (value) {
        this.element.setAttribute(this.name, '');
      } else {
        this.element.removeAttribute(this.name);
      }

      this.value = value;
    }

    this.__pendingValue = noChange;
  }

}
/**
 * Sets attribute values for PropertyParts, so that the value is only set once
 * even if there are multiple parts for a property.
 *
 * If an expression controls the whole property value, then the value is simply
 * assigned to the property under control. If there are string literals or
 * multiple expressions, then the strings are expressions are interpolated into
 * a string first.
 */

class PropertyCommitter extends AttributeCommitter {
  constructor(element, name, strings) {
    super(element, name, strings);
    this.single = strings.length === 2 && strings[0] === '' && strings[1] === '';
  }

  _createPart() {
    return new PropertyPart(this);
  }

  _getValue() {
    if (this.single) {
      return this.parts[0].value;
    }

    return super._getValue();
  }

  commit() {
    if (this.dirty) {
      this.dirty = false; // eslint-disable-next-line @typescript-eslint/no-explicit-any

      this.element[this.name] = this._getValue();
    }
  }

}
class PropertyPart extends AttributePart {} // Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the third
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.

let eventOptionsSupported = false; // Wrap into an IIFE because MS Edge <= v41 does not support having try/catch
// blocks right into the body of a module

(() => {
  try {
    const options = {
      get capture() {
        eventOptionsSupported = true;
        return false;
      }

    }; // eslint-disable-next-line @typescript-eslint/no-explicit-any

    window.addEventListener('test', options, options); // eslint-disable-next-line @typescript-eslint/no-explicit-any

    window.removeEventListener('test', options, options);
  } catch (_e) {// event options not supported
  }
})();

class EventPart {
  constructor(element, eventName, eventContext) {
    this.value = undefined;
    this.__pendingValue = undefined;
    this.element = element;
    this.eventName = eventName;
    this.eventContext = eventContext;

    this.__boundHandleEvent = e => this.handleEvent(e);
  }

  setValue(value) {
    this.__pendingValue = value;
  }

  commit() {
    while (isDirective(this.__pendingValue)) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange;
      directive(this);
    }

    if (this.__pendingValue === noChange) {
      return;
    }

    const newListener = this.__pendingValue;
    const oldListener = this.value;
    const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
    const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);

    if (shouldRemoveListener) {
      this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
    }

    if (shouldAddListener) {
      this.__options = getOptions(newListener);
      this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
    }

    this.value = newListener;
    this.__pendingValue = noChange;
  }

  handleEvent(event) {
    if (typeof this.value === 'function') {
      this.value.call(this.eventContext || this.element, event);
    } else {
      this.value.handleEvent(event);
    }
  }

} // We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.

const getOptions = o => o && (eventOptionsSupported ? {
  capture: o.capture,
  passive: o.passive,
  once: o.once
} : o.capture);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Creates Parts when a template is instantiated.
 */

class DefaultTemplateProcessor {
  /**
   * Create parts for an attribute-position binding, given the event, attribute
   * name, and string literals.
   *
   * @param element The element containing the binding
   * @param name  The attribute name
   * @param strings The string literals. There are always at least two strings,
   *   event for fully-controlled bindings with a single expression.
   */
  handleAttributeExpressions(element, name, strings, options) {
    const prefix = name[0];

    if (prefix === '.') {
      const committer = new PropertyCommitter(element, name.slice(1), strings);
      return committer.parts;
    }

    if (prefix === '@') {
      return [new EventPart(element, name.slice(1), options.eventContext)];
    }

    if (prefix === '?') {
      return [new BooleanAttributePart(element, name.slice(1), strings)];
    }

    const committer = new AttributeCommitter(element, name, strings);
    return committer.parts;
  }
  /**
   * Create parts for a text-position binding.
   * @param templateFactory
   */


  handleTextExpression(options) {
    return new NodePart(options);
  }

}
const defaultTemplateProcessor = new DefaultTemplateProcessor();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * The default TemplateFactory which caches Templates keyed on
 * result.type and result.strings.
 */

function templateFactory(result) {
  let templateCache = templateCaches.get(result.type);

  if (templateCache === undefined) {
    templateCache = {
      stringsArray: new WeakMap(),
      keyString: new Map()
    };
    templateCaches.set(result.type, templateCache);
  }

  let template = templateCache.stringsArray.get(result.strings);

  if (template !== undefined) {
    return template;
  } // If the TemplateStringsArray is new, generate a key from the strings
  // This key is shared between all templates with identical content


  const key = result.strings.join(marker); // Check if we already have a Template for this key

  template = templateCache.keyString.get(key);

  if (template === undefined) {
    // If we have not seen this key before, create a new Template
    template = new Template(result, result.getTemplateElement()); // Cache the Template for this key

    templateCache.keyString.set(key, template);
  } // Cache all future queries for this TemplateStringsArray


  templateCache.stringsArray.set(result.strings, template);
  return template;
}
const templateCaches = new Map();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const parts = new WeakMap();
/**
 * Renders a template result or other value to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result Any value renderable by NodePart - typically a TemplateResult
 *     created by evaluating a template tag like `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param options RenderOptions for the entire render tree rendered to this
 *     container. Render options must *not* change between renders to the same
 *     container, as those changes will not effect previously rendered DOM.
 */

const render = (result, container, options) => {
  let part = parts.get(container);

  if (part === undefined) {
    removeNodes(container, container.firstChild);
    parts.set(container, part = new NodePart(Object.assign({
      templateFactory
    }, options)));
    part.appendInto(container);
  }

  part.setValue(result);
  part.commit();
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time

if (typeof window !== 'undefined') {
  (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.3.0');
}
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */


const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// unsafeHTML directive, and the DocumentFragment that was last set as a value.
// The DocumentFragment is used as a unique key to check if the last value
// rendered to the part was with unsafeHTML. If not, we'll always re-render the
// value passed to unsafeHTML.

const previousValues = new WeakMap();
/**
 * Renders the result as HTML, rather than text.
 *
 * Note, this is unsafe to use with any user-provided input that hasn't been
 * sanitized or escaped, as it may lead to cross-site-scripting
 * vulnerabilities.
 */

const unsafeHTML = directive(value => part => {
  if (!(part instanceof NodePart)) {
    throw new Error('unsafeHTML can only be used in text bindings');
  }

  const previousValue = previousValues.get(part);

  if (previousValue !== undefined && isPrimitive(value) && value === previousValue.value && part.value === previousValue.fragment) {
    return;
  }

  const template = document.createElement('template');
  template.innerHTML = value; // innerHTML casts to string internally

  const fragment = document.importNode(template.content, true);
  part.setValue(fragment);
  previousValues.set(part, {
    value,
    fragment
  });
});

const isOnServer = () => {
  return typeof global !== "undefined" && global.SSR;
};

class MoonElement extends StyledElement {
  constructor(options) {
    super({
      deferUpdate: false,
      shadowRender: false,
      styles: [],
      adoptGlobalStyles: true,
      mutationObserverOptions: {
        childList: false
      },
      ...options
    });
    this._template = this._options.template;

    if (!isOnServer() && this._options.shadowRender) {
      this.attachShadow({
        mode: 'open'
      });
    }
  } // 1. we need to skip initial render when we already have rendered server side


  connectedCallback() {
    // define all attributes to "this" as properties
    this.defineAttributesAsProperties(); // define all properties to "this"

    this.defineProperties(); // define all computed properties to "this"

    this.defineComputedProperties(); // define everything that should be observed

    this.defineObserver();

    if (this.hasAttribute('ssr')) {
      this.registerEventsAndRefs();

      if (!isOnServer() && !this._options.shadowRender) {
        this.triggerHook('connected');
      }

      if (!isOnServer() && this._options.shadowRender) {
        this.requestUpdate({
          notify: false
        }).then(() => {
          this.triggerHook('connected');
        });
      }

      this.setAttribute('hydrate', 'true');
    } else if (this.hasAttribute('defer-update') || this._options.deferUpdate) {
      // don't updates/render, but register refs and events
      this.registerEventsAndRefs();
      this.triggerHook('connected');
    } else {
      this.requestUpdate({
        notify: false
      }).then(() => {
        this.triggerHook('connected');
      });
    }
  } // 2. we need to be able to inject properties from outside that will contain the attributes as well


  defineProperties(properties = this.properties()) {
    Object.keys(properties).forEach(prop => {
      // when mixing shadow dom elements with light dom elements and nesting custom elements
      // it might occur that properties where set on an element before it was
      // registered or connected. To avoid such timing issues we check
      // if a value was set for that specific property on the
      // prototype before assigning a default value
      const value = this[prop] || properties[prop];
      this.defineProperty(prop, value);
    });
  }

  defineProperty(property, value, reflectAttribute = false) {
    if (!isOnServer()) {
      return super.defineProperty(property, value, reflectAttribute);
    } else {
      this[property] = value;
    }
  }

  update(options) {
    this.renderTemplate();

    if (!isOnServer()) {
      this.appendStyleSheets(this._styles);
      super.update(options);
    }
  } // 3. we need to inject a different context for the template method to be able to switch from lit-html to something that runs in node


  renderTemplate() {
    const template = this._template || this.template();

    if (typeof template === 'string') {
      // just a plain string literal. no lit-html required
      this.getRoot().innerHTML = `${template}`;
    } else {
      // render via lit-html
      render(template, this.getRoot(), {
        scopeName: this.localName,
        eventContext: this
      });
    }
  }

  template() {
    return '';
  }

  getRoot() {
    return this.shadowRoot !== null ? this.shadowRoot : this;
  }

  dependencies() {
    return [];
  }
  /**
   * This will be loaded each time the custom element is found on the page.
   * Make sure to really only load data which is unique for every element on the page.
   *
   * Here we can make calls to the database or any other service with data we require on each page load.
   *
   * If we are statically exporting the site, these properties won't ever be loaded.
   *
   * @param {*}
   *
   * @returns {Promise<{}>}   An object which holds the dynamically loaded data.
   *                          Make sure that each key returned by this method is also present
   *                          inside your {@link properties() } method. If a key is not
   *                          present, it won't be passed to the client.
   */


  async loadDynamicProperties({
    request,
    response
  }) {
    return false;
  }
  /**
   * These properties will be loaded once as the server starts up, or if
   * we want to statically export our site.
   *
   * @returns {Promise<{}>}   An object which holds the statically loaded data.
   *                          Make sure that each key returned by this method is also present
   *                          inside your {@link properties() } method. If a key is not
   *                          present, it won't be passed to the client.
   */


  static async loadStaticProperties() {
    return false;
  }

  static get disableSSR() {
    return false;
  }

  static get dynamicPropertiesCacheable() {
    return false;
  }

}

class MoonDownElement extends MoonElement {
  async loadDynamicProperties({
    request,
    response
  }) {
    if (!this.source) {
      return {};
    }

    const fs = (await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('fs')); })).default;

    if (!fs.existsSync(this.source)) {
      console.log(`File ${this.source} does not exist.`);
      return {};
    }

    const frontmatter = (await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('@github-docs/frontmatter')); })).default;
    const marked = (await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('marked')); })).default;
    const result = frontmatter(fs.readFileSync(this.source, {
      encoding: "utf-8"
    }));
    return {
      text: marked(result.content),
      ...result.data
    };
  }

  static get dynamicPropertiesCacheable() {
    return true;
  }

}

const scripts = ({
  html
}) => {
  return html`
        <script src="/libraries/webcomponents-bundle.js" nomodule></script>
        <script src="/assets/bundle.legacy.js" nomodule></script>
    `;
};

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

const HOOKS = {
  HOOKS_LOADED: "hooks-loaded",
  COMPONENTS_LOADED: "components-loaded",
  SERVER_STARTED: "server-started",
  ROUTES_BEFORE_REGISTER: "routes-before-register",
  ROUTES_AFTER_REGISTER: "routes-after-register",
  REQUEST_RECEIVED: "request-received",
  MIDDLEWARE_REGISTER: "middleware-register",
  CSS_LOAD: "css-load"
};

const getBaseRequestHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

const apiRequest = async (api, {
  method = "GET",
  headers = []
}) => {
  const parts = api.split("/").filter(part => part.length > 0);

  try {
    const response = await fetch(["api", ...parts].join("/"), {
      method,
      headers: { ...getBaseRequestHeaders(),
        ...headers
      }
    });

    if (response.ok) {
      return {
        success: true,
        response,
        data: await response.json()
      };
    }

    return {
      success: false,
      response
    };
  } catch (error) {
    return {
      success: false,
      error
    };
  }
};

const layouts = {
  base: template
};

exports.BaseElement = BaseElement;
exports.HOOKS = HOOKS;
exports.MoonDownElement = MoonDownElement;
exports.MoonElement = MoonElement;
exports.apiRequest = apiRequest;
exports.html = html;
exports.layouts = layouts;
exports.unsafeHTML = unsafeHTML;
//# sourceMappingURL=client.js.map
