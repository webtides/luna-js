import {StyledElement } from '@webtides/element-js/src/StyledElement';

export default class TemplateElement extends StyledElement {
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
        } else if (this.hasAttribute('defer-update') || this._options.deferUpdate) {
            // don't updates/render, but register refs and events
            this.registerEventsAndRefs();

            this.triggerHook('connected');
        } else {
            this.registerEventsAndRefs();
            this.triggerHook('connected');
            this.setAttribute('hydrated', 'true');
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

    update(options) {
        this.renderTemplate();
        super.update(options);
    }

    // 3. we need to inject a different context for the template method to be able to switch from lit-html to something that runs in node
    renderTemplate() {
        const template = this._template || this.template({ html });
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

    template({ html }) {
        return html``;
    }
}
