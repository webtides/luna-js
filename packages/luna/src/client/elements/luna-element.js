import {StyledElement} from '@webtides/element-js/src/StyledElement';
import { render } from '../../renderer';

/**
 * The main class from which server rendered elements should inherit.
 */
export default class LunaElement extends StyledElement {
    constructor(options) {
        super({
            deferUpdate: (options?.deferUpdate ?? true),
            shadowRender: false,
            styles: [],
            adoptGlobalStyles: true,
            mutationObserverOptions: {
                childList: false,
            },
            ...options,
        });
        this._template = this._options.template;

        if (process.env.CLIENT_BUNDLE && this._options.shadowRender) {
            this.attachShadow({mode: 'open'});
        }

        if (process.env.SERVER_BUNDLE) {
            this.$$luna = {
                ...this.$$luna,
                request: options?.request,
                response: options?.response,
            };
        }
    }

    connectedCallback() {
        if (this.hasAttribute('ssr')) {
            this.setAttribute('hydrate', 'true');
        }

        super.connectedCallback();
    }

    defineProperties(properties = this.properties()) {
        Object.keys(properties).forEach((prop) => {
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
        if (process.env.CLIENT_BUNDLE) {
            return super.defineProperty(property, value, reflectAttribute);
        } else {
            this[property] = value;
        }
    }

    update(options) {
        this.renderTemplate();

        if (process.env.CLIENT_BUNDLE) {
            this.appendStyleSheets(this._styles);
            super.update(options);
        }
    }

    // 3. we need to inject a different context for the template method to be able to switch from lit-html to something that runs in node
    renderTemplate() {
        const template = this._template || this.template();

        if (typeof template === 'string') {
            // just a plain string literal. no lit-html required
            this.getRoot().innerHTML = `${template}`;
        } else {
            // render via lit-html
            render(template, this.getRoot(), {
                scopeName: this.localName,
                eventContext: this,
            });
        }
    }

    template() {
        return '';
    }

    getRoot() {
        return this.shadowRoot !== null ? this.shadowRoot : this;
    }

    /**
     * An array of tag names this custom element has as children. Useful for when the element
     * is only rendered on the client, but we still need to inform the framework that it's children
     * should be loaded.
     *
     * @returns {string[]}
     */
    dependencies() { return []; }

    /**
     * This will be loaded each time the custom element is found on the page.
     * Make sure to really only load data which is unique for every element on the page.
     *
     * Here we can make calls to the database or any other service with data we require on each page load.
     *
     * @param {*}
     *
     * @returns {Promise<{}>}   An object which holds the dynamically loaded data.
     *                          Make sure that each key returned by this method is also present
     *                          inside your {@link properties() } method. If a key is not
     *                          present, it won't be passed to the client.
     */
    async loadDynamicProperties({ request, response }) {
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

    /**
     * Sets the dynamic properties to be cacheable. Normally the dynamic properties will be reloaded
     * on every request. With this flag they will only be loaded once and then cached.
     *
     * @returns {boolean}
     */
    static get dynamicPropertiesCacheable() { return false; }
}
