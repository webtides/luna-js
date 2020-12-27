import {paramCase} from "param-case";
import cheerio from "cheerio";
import {loadCustomElement} from "./component-loader";
import {html, renderToString} from "@popeindustries/lit-html-server";

const extractStyles = (element) => {
    if (element._styles.length > 0) {
        return element._styles;
    }
    return false;
};

const renderNodeAsCustomElement = async (node) => {
    const tag = node.tagName;
    const component = await loadCustomElement(tag);

    if (!component) {
        return false;
    }

    const attributes = node.attributes || { };
    attributes["ssr"] = true;

    const element = new (component.element)();
    element.defineProperties({
        ...element.properties(),
        ...node.attributes,
    });

    component.styles = extractStyles(element);

    const markup = await renderToString(element.template({html}));
    const innerDocument = await parseHtmlDocument(cheerio.load(markup, null, false));

    return {
        attributes,
        component,
        innerHTML: !element._options.shadowRender ? innerDocument.html() : ""
    };
};


const parseHtmlDocument = async ($, upgradedElements) => {
    await Promise.all($("*").map(async (index, node) => {
        if (node.tagName.includes("-")) {
            // This is potentially a custom element.
            const result = await renderNodeAsCustomElement(node, upgradedElements);

            if (!result) {
                return;
            }

            const { component, attributes, innerHTML } = result;

            const $node = $(node);
            $node.html(innerHTML);

            attributes && Object.keys(attributes).forEach(key => $node.attr(key, attributes[key]));

            upgradedElements[node.tagName] = component;
        }
    }));

    return $;
};

export default async (htmlDocument) => {
    const $ = cheerio.load(htmlDocument, null, true);

    const upgradedElements = { };
    await parseHtmlDocument($, upgradedElements);

    $("body")
        .append(`<script type="module" src="/assets/elements/previous.js"></script>`)
        .append(`
        <script type="module">
            ${Object.keys(upgradedElements)
            .map(key => {
                const component = upgradedElements[key];
                const path = component.relativePath.split("/").pop();
                return `
                        import ${component.name} from "/assets/elements/${path}";
                        customElements.define("${paramCase(component.name)}", ${component.name});
                    `;
            })
            .join("\n")
        }
        </script>
    `);

    const $head = $("head");

    Object.keys(upgradedElements).forEach(key => {
        const component = upgradedElements[key];
        if (component.styles) {
            component.styles.forEach((style, index) => {
                $head.append(`<style id="${paramCase(component.name)}${index}">${style}</style>`);
            });
        }
    });

    return $.html();
};

