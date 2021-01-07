import {StyledElement} from '@webtides/element-js/src/StyledElement';

const isOnServer = () => {
    return (typeof global !== "undefined" && global.SSR);
}

export default class MoonElement extends StyledElement {

    constructor(options) {
        super({
            deferUpdate: false,
            shadowRender: false,
            styles: [],
            adoptGlobalStyles: true,
            mutationObserverOptions: {
                childList: false,
            },
            ...options,
        });
        this._template = this._options.template;

        if (!isOnServer() && this._options.shadowRender) {
            this.attachShadow({mode: 'open'});
        }
    }

    // 1. we need to skip initial render when we already have rendered server side
    connectedCallback() {
        // define all attributes to "this" as properties
        this.defineAttributesAsProperties();

        // define all properties to "this"
        this.defineProperties();

        // define all computed properties to "this"
        this.defineComputedProperties();

        // define everything that should be observed
        this.defineObserver();

        if (this.hasAttribute('ssr')) {

            this.registerEventsAndRefs();

            this.triggerHook('connected');

            this.setAttribute('hydrate', 'true');

            if (!isOnServer() && this._options.shadowRender) {
                this.requestUpdate({notify: false}).then(() => {
                    this.triggerHook('connected');
                });
            }

        } else if (this.hasAttribute('defer-update') || this._options.deferUpdate) {
            // don't updates/render, but register refs and events
            this.registerEventsAndRefs();

            this.triggerHook('connected');
        } else {
            this.requestUpdate({notify: false}).then(() => {
                this.triggerHook('connected');
            });
        }
    }

    // 2. we need to be able to inject properties from outside that will contain the attributes as well
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
        if (!isOnServer()) {
            return super.defineProperty(property, value, reflectAttribute);
        } else {
            this[property] = value;
        }
    }

    update(options) {
        this.renderTemplate();

        if (!isOnServer()) {
            super.update(options);
        }
    }

    // 3. we need to inject a different context for the template method to be able to switch from lit-html to something that runs in node
    renderTemplate() {
        const template = this._template || this.template({html, unsafeHTML});
        if (typeof template === 'string') {
            // just a plain string literal. no lit-html required
            this.getRoot().innerHTML = `${template}`;
        } else {
            // render via lit-html
            render(html`${template} `, this.getRoot(), {
                scopeName: this.localName,
                eventContext: this,
            });
        }
    }

    template({html, unsafeHTML}) {
        return html``;
    }

    // custom polyfill for constructable stylesheets by appending styles to the end of an element
    appendStyleSheets(styles) {
        if (this.hasAttribute('ssr')) {
            // Don't append stylesheets if the element was rendered on the server.
            return;
        }

        super.appendStyleSheets(styles);
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

    static get disableSSR() { return false; }
}
