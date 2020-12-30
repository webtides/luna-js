import {paramCase} from "param-case";
import cheerio from "cheerio";
import {loadSingleComponentByTagName} from "../loaders/component-loader";
import {html, renderToString} from "@popeindustries/lit-html-server";
import {loadFromCache, writeToCache} from "../cache/cache";

const extractStyles = (element) => {
    if (element._styles.length > 0) {
        return element._styles;
    }
    return false;
};

/**
 * Takes a single component object and renders the element.
 * Fetches all dynamic properties for the component & loads
 * the static properties.
 *
 * @param component ({ element: * })
 * @param attributes
 *
 * @returns {Promise<{markup: string, element: *}>}
 */
const renderComponent = async (component, attributes = {}) => {
    const cachedValue = await loadFromCache(component.element.name, "components");
    if (cachedValue) {
        return cachedValue;
    }

    attributes["ssr"] = true;

    const element = new (component.element)();

    const dynamicProperties = await element.loadDynamicProperties();

    const properties = {
        ...element.properties(),
        ...attributes,
        ...(component.element.staticProperties ?? { }),
        ...(dynamicProperties ? dynamicProperties : { })
    };

    element.defineProperties(properties);

    // Define the attributes so that they can accessed on the client.
    Object.keys(properties).forEach(key => {
        attributes[paramCase(key)] = JSON.stringify(properties[key]);
    });

    component.styles = extractStyles(element);

    const markup = await renderToString(element.template({html}));

    if (!dynamicProperties) {
        await writeToCache(component.element.name, { markup, element }, "components");
    }

    return { markup, element };
};

/**
 * Takes a cheerio-node and tries to match it with a custom element.
 * Recursively renders & upgrades all child elements.
 *
 * @param node Node
 * @param upgradedElements *
 * @returns {Promise<boolean|{component: ({file: string, relativePath: string, name: *, element: *}|boolean), innerHTML: (jQuery|string), attributes: (*|{})}>}
 */
const renderNodeAsCustomElement = async (node, upgradedElements) => {
    const tag = node.tagName;
    const component = await loadSingleComponentByTagName(tag);

    if (!component) {
        return false;
    }

    if (component.element.disableSSR) {
        return {
            component,
            noSSR: true
        }
    }

    const attributes = node.attributes || {};

    const { markup, element } = await renderComponent(component, attributes);

    const innerDocument = await parseHtmlDocument(cheerio.load(markup, null, false), upgradedElements);

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
 * @returns {Promise<jQuery|HTMLElement>}
 */
const parseHtmlDocument = async ($, upgradedElements) => {
    await Promise.all($("*").map(async (index, node) => {
        if (node.tagName.includes("-")) {
            // This is potentially a custom element.
            const result = await renderNodeAsCustomElement(node, upgradedElements);

            if (!result) {
                return;
            }

            if (result.noSSR) {
                upgradedElements[node.tagName] = result.component;
                return;
            }

            const {component, attributes, innerHTML} = result;

            const $node = $(node);
            $node.html(innerHTML);

            attributes && Object.keys(attributes).forEach(key => $node.attr(key, attributes[key]));

            upgradedElements[node.tagName] = component;
        }
    }));

    return $;
};

const appendUpgradedElementsToDocument = ($, upgradedElements) => {
    $("body")
        .append(`<script type="module" src="/assets/moon.js"></script>`)
        .append(`
            <script type="module">
                ${Object.keys(upgradedElements)
                .map(key => {
                    const component = upgradedElements[key];
                    const componentPath = component.relativePath.split("/").pop();
    
                    return `
                        import ${component.name} from "/assets/${componentPath}";
                        customElements.define("${paramCase(component.name)}", ${component.name});
                    `;
                })
                .join("\n")
            }
            </script>
        `);
};

const appendStylesOfUpgradedElementsToHead = ($, upgradedElements) => {

    const $head = $("head");

    Object.keys(upgradedElements).forEach(key => {
        const component = upgradedElements[key];

        if (component.styles) {
            component.styles.forEach((style, index) => {
                $head.append(`<style id="${paramCase(component.name)}${index}">${style}</style>`);
            });
        }
    });

};

export {renderComponent};

export default async (htmlDocument) => {
    const $ = cheerio.load(htmlDocument, null, true);

    const upgradedElements = {};
    await parseHtmlDocument($, upgradedElements);

    appendUpgradedElementsToDocument($, upgradedElements);
    appendStylesOfUpgradedElementsToHead($, upgradedElements);

    return $.html();
};

