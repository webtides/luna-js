'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
    const template = this._template || this.template({
      html,
      unsafeHTML
    });

    if (typeof template === 'string') {
      // just a plain string literal. no lit-html required
      this.getRoot().innerHTML = `${template}`;
    } else {
      // render via lit-html
      render(html`${template} `, this.getRoot(), {
        scopeName: this.localName,
        eventContext: this
      });
    }
  }

  template({
    html,
    unsafeHTML
  }) {
    return html``;
  }

  getRoot() {
    return this.shadowRoot !== null ? this.shadowRoot : this;
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

const layouts = {
  base: template
};

exports.HOOKS = HOOKS;
exports.MoonElement = MoonElement;
exports.layouts = layouts;
//# sourceMappingURL=index.js.map
