import { HTMLElement, Element, CustomElementRegistry } from '@lit-labs/ssr-dom-shim';

export const getWindow = ({ includeJSBuiltIns = false, props = {} }) => {
    class ShadowRoot {}

    class Document {
        get adoptedStyleSheets() {
            return [];
        }
        createTreeWalker() {
            return {};
        }
        createTextNode() {
            return {};
        }
        createElement() {
            return {};
        }
    }

    class CSSStyleSheet {
        replace() {}
    }

    const window = {
        Element,
        HTMLElement,
        Document,
        document: new Document(),
        CSSStyleSheet,
        ShadowRoot,
        CustomElementRegistry,
        customElements: new CustomElementRegistry(),
        btoa(s) {
            return Buffer.from(s, 'binary').toString('base64');
        },

        // location: new URL('http://localhost'),
        MutationObserver: class {
            observe() {}
        },

        // crypto: {
        //     randomUUID() {},
        // },

        // No-op any async tasks
        requestAnimationFrame() {},

        // Set below
        window: undefined,

        // User-provided globals, like `require`
        ...props,
    };

    if (includeJSBuiltIns) {
        Object.assign(window, {
            // No-op any async tasks
            setTimeout() {},
            clearTimeout() {},
            // Required for node-fetch
            Buffer,
            // URL,
            // URLSearchParams,
            console: {
                log(...args) {
                    console.log(...args);
                },
                info(...args) {
                    console.info(...args);
                },
                warn(...args) {
                    console.warn(...args);
                },
                debug(...args) {
                    console.debug(...args);
                },
                error(...args) {
                    console.error(...args);
                },
                assert(bool, msg) {
                    if (!bool) {
                        throw new Error(msg);
                    }
                },
            },
        });
    }

    return window;
};

export const installWindowOnGlobal = (props = {}) => {
    // Avoid installing the DOM shim if one already exists
    if (globalThis.window === undefined) {
        const window = getWindow({ props });
        // Copy initial window globals to node global
        Object.assign(globalThis, window);
    }
};
